import { execSync, spawn, spawnSync } from 'child_process'
import operatingSystem from 'os'
import path from 'path'
import filesystem from 'fs'
import assert from 'assert'
import resolve from 'resolve' // use 'resolve' module to allow passing 'preserve symlinks' option that is not supported by require.resolve module.
import * as dockerode from 'dockerode'
import * as jsYaml from 'js-yaml'
import createDirectoryRecursive from 'mkdirp'
// while developing, allow dependency symlinks to work in containers.
const developmentCodeFolder = path.join(operatingSystem.homedir(), 'code'),
  yarnLinkFolrder = path.join(operatingSystem.homedir(), '.config')

// the image used for development, building of projects, and production deployment, which contains essential tools and binaries (e.g. rsync)
const dockerDeploymentImage = 'myuserindocker/deployment-environment:latest' || 'node:current' // nodejs 12 to support nodegit version that works with Debian 10

export async function dockerCli({ api /* supplied by scriptManager */, scriptCommand = '/bin/bash' } = {}) {
  const applicationPath = path.join(api.project.configuration.rootPath, 'entrypoint/cli'),
    rootPath = api.project.configuration.rootPath,
    containerProjectPath = rootPath

  let executableCommand = [
    'docker',
    `run`,

    // `--name ${'project'}`,

    // --experimental-modules --input-type=commonj
    '--init', // Fixes signal handlers & reaping (process of eliminating zombie processes).  https://github.com/krallin/tini https://github.com/docker/cli/pull/1841
    '--sig-proxy', // pass signals
    `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process. tty = Unix/Linux terminal access handling using modem based connection (allows input from terminal), iteractive = accepts input from host.
    `--rm`, // automatically remove after container exists.
    `--workdir ${containerProjectPath}`,

    `--volume ${rootPath}:${containerProjectPath}`,
    // local development related paths
    `--volume ${developmentCodeFolder}:${developmentCodeFolder}`,
    `--volume ${yarnLinkFolrder}:${yarnLinkFolrder}`,
    `--volume /var/run/docker.sock:/var/run/docker.sock`,
    // `--volume ${operatingSystem.homedir()}/.ssh:/project/.ssh`,

    // allow for using local user name (of host machine) to write files and permissions through the docker container. https://medium.com/faun/set-current-host-user-for-docker-container-4e521cef9ffc
    `--user ${operatingSystem.userInfo().uid}:${operatingSystem.userInfo().gid}`, // uid:gid
    `--volume /etc/passwd:/etc/passwd:ro`,
    `--volume /etc/group:/etc/group:ro`,
    `--volume /etc/shadow:/etc/shadow:ro`,

    // container name is registered by Docker automatically for non default networks as hostnames in other containers (default bridge network will not use hostname DNS), allowing access to the memgraph container through it's name. (default network doesn't support aliases)
    `--network=${'external'}`,
    `--network-alias ${'application'}`, // make container discoverable by another hostname in addition to the container name for specific network.
    // `--add-host memgraph:172.17.0.3`,

    // `-P`, // Publish all exposed ports to the host interfaces
    `-p 443:443 -p 8080:8080 -p 8081:8081 -p 8082:8082 -p 8083:8083 -p 8084:8084 -p 8085:8085`, //services ports
    `-p 9229:9229`, // Nodejs's remote debugger
    `-p 9090:9090 -p 9901:9901 -p 9902:9902`, // Browsersync livereload

    /*  'myuserindocker/deployment-environment:latest'
        'myuserindocker/deployment-environment:simple_NodeDockerCompose'
        this container should have docker client & docker-compose installed in.*/
    `${dockerDeploymentImage}`,
    scriptCommand,
  ]

  console.log('container command' + ': \n', scriptCommand)
  console.log(`• docker command: "${executableCommand.join(' ')}"`)

  let option = {
    cwd: rootPath,
    detached: false,
    shell: true,
    stdio: [0, 1, 2],
    // IMPORTANT: global environment should be passed to allow for docker commands to work inside nodejs process, as the WSL uses an environment variable to connect to the Windows Docker engine socket.
    env: Object.assign({}, process.env, {
      // DEPLOYMENT: 'development',
    }),
  }
  const [command, ...commandArgument] = executableCommand
  spawnSync(command, commandArgument, option)
}

// compose options https://docs.docker.com/compose/compose-file/#entrypoint
// compose command options https://docs.docker.com/compose/reference/overview/
export async function dockerComposeCli({ api /* supplied by scriptManager */, scriptCommand = '/bin/bash' } = {}) {
  const targetProjectConf = api.project.configuration.configuration,
    rootPath = api.project.configuration.rootPath,
    targetTemporaryFolder = path.join(rootPath, 'temporary'),
    containerProjectPath = rootPath

  await createDirectoryRecursive(targetTemporaryFolder)

  let option = {
    cwd: rootPath,
    detached: false,
    shell: true,
    stdio: [0, 1, 2],
    // IMPORTANT: global environment should be passed to allow for docker commands to work inside nodejs process, as the WSL uses an environment variable to connect to the Windows Docker engine socket.
    env: Object.assign({}, process.env, {
      // DEPLOYMENT: 'development',
    }),
  }

  let portList = [
    ...targetProjectConf.apiGateway.service.map(item => item.port).filter(item => item),
    // Additional development ports
    ...[
      // Nodejs's remote debugger
      9229,
      // Browsersync livereload
      9090,
      9901,
      9902,
    ],
  ]
  let serviceConfig = {
    version: '3.7',

    networks: {
      internal: {
        driver: 'bridge', // network dirver:  bridge for the same host, while overlay is for swarm hosts.
      },
    },

    services: {
      application: {
        image: dockerDeploymentImage,

        // export ports to host machine:
        // to change port interface (ip) use "127.0.0.1:80:80"
        ports: portList.map(port => {
          return {
            target: port,
            published: port,
            // mode: 'host',
          }
        }),

        networks: {
          internal: {
            aliases: ['application'],
          },
        },

        volumes: [
          `${rootPath}:${containerProjectPath}`,
          // local development related paths
          `${developmentCodeFolder}:${developmentCodeFolder}`,
          `${yarnLinkFolrder}:${yarnLinkFolrder}`,
          `/var/run/docker.sock:/var/run/docker.sock`,

          // allow for using local user name (of host machine) to write files and permissions through the docker container. https://medium.com/faun/set-current-host-user-for-docker-container-4e521cef9ffc
          `/etc/passwd:/etc/passwd:ro`,
          `/etc/group:/etc/group:ro`,
          `/etc/shadow:/etc/shadow:ro`,
        ],

        user: `${operatingSystem.userInfo().uid}:${operatingSystem.userInfo().gid}`, // uid:gid
        working_dir: rootPath,
        // IMPORTANT: if executed with command `/bin/sh -c ''`, as default docker does, the interrupt signals will not be passed to the running process and thus will not abort the containers. Therefore /bin/bash -c should be used, or ENTRYPOINT instead of COMMAND will use bash by default.
        // IMPORTANT: node --eval doesn't pass signals correctly in docker command, but wrapping it through npm scripts (yarn run <script name>) adds functionality.
        command: scriptCommand,
        // entrypoint:
        //   // ['node', `--eval`, `require(process.cwd()).application({},{memgraph:{host:'memgraph'}})`] || ['yarn', 'run', 'run-configuredForContainer'] ||
        //   `${scriptCommand}`.split(' ').filter(item => item.length /*Remove empty values*/), // `/bin/bash -c "ls -al"`

        // https://docs.docker.com/compose/compose-file/#domainname-hostname-ipc-mac_address-privileged-read_only-shm_size-stdin_open-tty-user-working_dir
        // works only with docker-compose run but doesn't work for some reason with docker-compose up (stuck on 'attaching <serviceName>..')
        tty: true,
        stdin_open: true,
      },

      memgraph: {
        image: 'memgraph:latest',

        // export ports to host machine:
        ports: [
          {
            target: 7687,
            // published: 7687,
          },
        ],

        networks: {
          internal: {
            aliases: ['memgraph'],
          },
        },
      },
    },
  }

  // convert service configuration into yaml file in temporary location, to be used later with docker-compose.
  let yamlFile = path.join(targetTemporaryFolder, 'dockerCompose.yaml')
  filesystem.writeFileSync(yamlFile, jsYaml.dump(serviceConfig, { lineWidth: Infinity, noCompatMode: true }))

  let dockerComposeCommand = `docker-compose --file ${yamlFile} --project-name webappProject --log-level INFO`

  {
    // Note: necessary step as recreating services will use previously created volumes (e.g. database anonymous volume)
    // stop and remove containers and volumes related to project name from previous running
    let executableCommand = [
      [
        dockerComposeCommand,
        'down --volumes', // remove volumes attached to containers.
      ].join(' '),
    ]
    const [command, ...commandArgument] = executableCommand
    spawnSync(command, commandArgument, option)
  }

  let executableCommand = [
    [
      dockerComposeCommand,

      // run: allows attaching to the container
      // service-ports allows mapping of ports to host as set in yml file.
      // `run --rm --service-ports --use-aliases application`,

      // up
      // --detach
      `up --no-build --force-recreate --abort-on-container-exit --always-recreate-deps`,
    ].join(' '),
  ]

  console.log('container command' + ': \n', scriptCommand)
  console.log(`• docker command: "${executableCommand.join(' ')}"`)
  const [command, ...commandArgument] = executableCommand
  spawnSync(command, commandArgument, option)

  // down: allows to remove containers in addition to stopping them.
  // TODO: Doesn't work, seems related to the signal transmition to the process through container commands.
  process.on('SIGINT', (code, signal) => {
    console.log(`[Process ${process.pid}]: signal ${signal}, code ${code};`)
    // stop and remove containers related to project name.
    let executableCommand = [
      [
        dockerComposeCommand,
        'down',
        // --volumes //remove volumes attached to containers.
      ].join(' '),
    ]
    const [command, ...commandArgument] = executableCommand
    spawnSync(command, commandArgument, option)
  })
}
