import * as dockerode from 'dockerode'
import * as jsYaml from 'js-yaml'
import { execSync, spawn, spawnSync } from 'child_process'
import path from 'path'
import filesystem from 'fs'
import assert from 'assert'
const resolve = require('resolve') // use 'resolve' module to allow passing 'preserve symlinks' option that is not supported by require.resolve module.
import operatingSystem from 'os'

// when using `localhost` chrome shows the files in folders, while using `0.0.0.0` files appear as separated. `0.0.0.0` allows access from any port (could be useful in containers as external connections not always referred to localhost it seems.)

/** When running inside container, docker client communicates with MobeyLinuxVM on Windows host machine, and the volume paths will be related or referencing to the hyper-v MobyLinuxVM vm. In it here is a folder /host_mount/c that corresponds to the Widnows host filesystem drive.
  In case of Docker for Windows, the path is a Windows path. While the path sent from a running container, should be refering to the hyper-v MobyLinuxVM (inside created by Docker for Windows are /host_mnt/c, with symlinks /c & /C).
**/

{
  option = {
    cwd: applicationPath,
    detached: false,
    shell: true,
    // stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    stdio: [0, 1, 2],
    env: {
      DEPLOYMENT: 'development',
      hostPath: process.env.hostPath,
    },
  }
  spawnSync(command, commandArgument, option)

  let childProcess = spawn(processCommand, processCommandArgs, processOption)
  childProcess.on('error', err => throw err)
  childProcess.on('exit', () => console.log(`PID: Child ${childProcess.pid} terminated.`))
  childProcess.unref() // prevent parent from waiting to child process and un reference child from parent's event loop.
  childProcess.on('exit', () => {
    spawnSync('docker', [`kill ${containerPrefix}`], {
      detached: false,
      shell: true,
      stdio: 'inherit',
      env: process.env, // pass environment variables like process.env.PWD to spawn process
    })
  })
  console.log(`PID: Child ${childProcess.pid}`)
  process.on('SIGINT', () => {
    // when docker is using `-it` option this event won't be fired in this process, as the SIGINT signal is passed directly to the docker container.
    childProcess.kill('SIGINT')
  })
}

{
  /** docker */
  ;[
    `run`,
    `--rm`, // automatically remove after container exists.
    `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process.
    `--volume ${application.hostPath}:${application.pathInContainer}`,
    // `--volume ${scriptManagerHostPath}:/project/scriptManager`,
    `--volume /var/run/docker.sock:/var/run/docker.sock`,
    `--volume ${operatingSystem.homedir()}/.ssh:/project/.ssh`,
    `--network=${networkName}`,
    `--network-alias ${networkAlais}`,
    `-P`,
    `--env applicationPathOnHostMachine=${applicationPathOnHostMachine}`,
    `--env sshUsername=${operatingSystem.userInfo().username}`,
    `--env PWD=${workingDirectoryInContainer_PWD}`, // pass PWD absolute path as in container (convert host machine path to container path)
    `--workdir ${workingDirectoryInContainer_CWD}`,
    `--env configurationPath=${configurationAbsoluteContainerPath}`, // pass the absolute path of the configuration file
    `--name ${containerPrefix}`,
    // 'myuserindocker/deployment-environment:simple_NodeDockerCompose' // this container should have docker client & docker-compose installed in.
    `${image}`, // 'myuserindocker/deployment-environment:latest' || 'node:latest'
    `${containerCommand}`,
  ]

  /** docker-compose */
  ;`docker-compose -f ${ymlFile} up -d --no-build --force-recreate --abort-on-container-exit ${serviceName}`
  ;`docker-compose -f ${ymlFile} build --no-cache ${serviceName}`
  ;[
    'docker-compose',
    `-f ${ymlFile}`,
    `--project-name ${containerPrefix}`,
    `run --service-ports --use-aliases`, // --service-ports is required when using run command, it allows mapping of ports to host as set in yml file.
    `--entrypoint '${containerCommand}'`, // `node script.js`
    `${serviceName}`,
  ]
  ;['docker-compose', `-f ${ymlFile}`, `--project-name ${projectName}`, `down`] // stop and remove containers related to project name.
  ;`docker-compose -f $dockerComposeFilePath pull containerDeploymentManagement` // pull previously built image
  ;`docker pull myuserindocker/deployment-environment:latest` // pull image

  /** docker network */
  ;['docker', `network create ${networkName}`]
}

// Check if docker image exists
;`
    dockerImage=myuserindocker/deployment-environment:latest;
    if [[ "$(docker images -q $dockerImage 2> /dev/null)" == "" ]]; then
        dockerImage=node:latest
    fi;
  `
