import * as dockerode from 'dockerode'
import * as jsYaml from 'js-yaml'
import { execSync, spawn, spawnSync } from 'child_process'
import path from 'path'
import filesystem from 'fs'
import assert from 'assert'
const resolve = require('resolve') // use 'resolve' module to allow passing 'preserve symlinks' option that is not supported by require.resolve module.
import operatingSystem from 'os'

export async function runApplication({ api /* supplied by scriptManager */ } = {}) {
  const applicationPath = path.join(api.project.configuration.rootPath, 'entrypoint/cli'),
    rootPath = api.project.configuration.rootPath

  let executableCommand = [
    'docker',
    `run`,
    `--rm`, // automatically remove after container exists.
    // `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process.
    `--volume ${rootPath}:${'/project'}`,
    `--volume /var/run/docker.sock:/var/run/docker.sock`,
    // `--volume ${operatingSystem.homedir()}/.ssh:/project/.ssh`,
    // `--network=${networkName}`,
    // `--network-alias ${networkAlais}`,
    `-P`, // Publish all exposed ports to the host interfaces
    // `--env applicationPathOnHostMachine=${applicationPathOnHostMachine}`,
    // `--env sshUsername=${operatingSystem.userInfo().username}`,
    // `--env PWD=${workingDirectoryInContainer_PWD}`, // pass PWD absolute path as in container (convert host machine path to container path)
    // `--env configurationPath=${configurationAbsoluteContainerPath}`, // pass the absolute path of the configuration file
    `--workdir ${'/project'}`,
    `--name ${'project'}`,
    // 'myuserindocker/deployment-environment:simple_NodeDockerCompose' // this container should have docker client & docker-compose installed in.
    `${'node:latest'}`, // 'myuserindocker/deployment-environment:latest' || 'node:latest'
    `${'ls -al ./'}`,
  ]

  let option = {
    cwd: rootPath,
    detached: false,
    shell: true,
    stdio: [0, 1, 2],
    //! important: global environment should be passed to allow for docker commands to work inside nodejs process, as the WSL uses an environment variable to connect to the Windows Docker engine socket.
    env: Object.assign({}, process.env, {
      // DEPLOYMENT: 'development',
    }),
  }
  const [command, ...commandArgument] = executableCommand
  spawnSync(command, commandArgument, option)
}
