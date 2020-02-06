import { execSync, spawn, spawnSync } from 'child_process'
import operatingSystem from 'os'
import path from 'path'
import filesystem from 'fs'
import assert from 'assert'
import resolve from 'resolve' // use 'resolve' module to allow passing 'preserve symlinks' option that is not supported by require.resolve module.
import * as dockerode from 'dockerode'
import * as jsYaml from 'js-yaml'
const developmentCodeFolder = path.join(operatingSystem.homedir(), 'code') // while developing, allow dependency symlinks to work in containers.

export async function runApplication({ api /* supplied by scriptManager */, scriptCommandName, scriptCommand = '/bin/bash' } = {}) {
  const applicationPath = path.join(api.project.configuration.rootPath, 'entrypoint/cli'),
    rootPath = api.project.configuration.rootPath

  let containerCommand = scriptCommandName ? `yarn run ${scriptCommandName}` : scriptCommand

  let executableCommand = [
    'docker',
    `run`,

    // `--name ${'project'}`,

    // --experimental-modules --input-type=commonj
    '--init', // Fixes signal handlers & reaping (process of eliminating zombie processes).  https://github.com/krallin/tini https://github.com/docker/cli/pull/1841
    '--sig-proxy', // pass signals
    `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process. tty = Unix/Linux terminal access handling using modem based connection (allows input from terminal), iteractive = accepts input from host.
    `--rm`, // automatically remove after container exists.
    `--workdir ${'/project'}`,

    `--volume ${developmentCodeFolder}:${developmentCodeFolder}`,
    `--volume ${rootPath}:${'/project'}`,
    `--volume /var/run/docker.sock:/var/run/docker.sock`,
    // `--volume ${operatingSystem.homedir()}/.ssh:/project/.ssh`,

    // container name is registered by Docker automatically for non default networks as hostnames in other containers (default bridge network will not use hostname DNS), allowing access to the memgraph container through it's name. (default network doesn't support aliases)
    `--network=${'shared'}`,
    `--network-alias ${'application'}`, // make container discoverable by another hostname in addition to the container name for specific network.
    // `--add-host memgraph:172.17.0.3`,

    // `-P`, // Publish all exposed ports to the host interfaces
    `-p 8080:8080 -p 8081:8081`,

    // 'myuserindocker/deployment-environment:latest' // 'myuserindocker/deployment-environment:simple_NodeDockerCompose' /* this container should have docker client & docker-compose installed in.*/ // `--env configurationPath=${configurationAbsoluteContainerPath}`, // pass the absolute path of the configuration file // `--env PWD=${workingDirectoryInContainer_PWD}`, // pass PWD absolute path as in container (convert host machine path to container path) // `--env sshUsername=${operatingSystem.userInfo().username}`, // `--env applicationPathOnHostMachine=${applicationPathOnHostMachine}`,
    `${'node:current'}`, // nodejs 12 to support nodegit
    containerCommand,
  ]

  console.log('container command' + ': \n', containerCommand)
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

  // let childProcess = spawn(processCommand, processCommandArgs, processOption)
  // childProcess.on('error', err => throw err)
  // childProcess.on('exit', () => console.log(`PID: Child ${childProcess.pid} terminated.`))
  // // childProcess.unref() // prevent parent from waiting to child process and un reference child from parent's event loop. When child process is referenced it forces the parent to wait for the child to exit before exiting itself.
  // childProcess.on('exit', () => {
  //   spawnSync('docker', [`kill ${containerName}`], {
  //     detached: false,
  //     shell: true,
  //     stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  //     env: process.env, // pass environment variables like process.env.PWD to spawn process
  //   })
  // })
  // process.on('SIGINT', () => {
  //   // when docker is using `-it` option this event won't be fired in this process, as the SIGINT signal is passed directly to the docker container.
  //   childProcess.kill('SIGINT')
  // })
}
