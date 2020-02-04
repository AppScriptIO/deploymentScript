import * as dockerode from 'dockerode'
import * as jsYaml from 'js-yaml'
import { execSync, spawn, spawnSync } from 'child_process'
import path from 'path'
import filesystem from 'fs'
import assert from 'assert'
const resolve = require('resolve') // use 'resolve' module to allow passing 'preserve symlinks' option that is not supported by require.resolve module.
import operatingSystem from 'os'

export async function runApplication({ api /* supplied by scriptManager */, scriptCommandName } = {}) {
  const applicationPath = path.join(api.project.configuration.rootPath, 'entrypoint/cli'),
    rootPath = api.project.configuration.rootPath

  let executableCommand = [
    'docker',
    `run`,

    // `--name ${'project'}`,
    `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process.
    `--rm`, // automatically remove after container exists.
    `--workdir ${'/project'}`,

    `--volume ${rootPath}:${'/project'}`,
    `--volume /var/run/docker.sock:/var/run/docker.sock`,
    `--volume /d:/d`,
    // `--volume ${operatingSystem.homedir()}/.ssh:/project/.ssh`,

    // container name is registered by Docker automatically for non default networks as hostnames in other containers (default bridge network will not use hostname DNS), allowing access to the memgraph container through it's name. (default network doesn't support aliases)
    `--network=${'shared'}`,
    `--network-alias ${'application'}`, // make container discoverable by another hostname in addition to the container name for specific network.
    // `--add-host memgraph:172.17.0.3`,

    // `-P`, // Publish all exposed ports to the host interfaces
    `-p 8080:8080 -p 8081:8081`,

    // 'myuserindocker/deployment-environment:latest' // 'myuserindocker/deployment-environment:simple_NodeDockerCompose' /* this container should have docker client & docker-compose installed in.*/ // `--env configurationPath=${configurationAbsoluteContainerPath}`, // pass the absolute path of the configuration file // `--env PWD=${workingDirectoryInContainer_PWD}`, // pass PWD absolute path as in container (convert host machine path to container path) // `--env sshUsername=${operatingSystem.userInfo().username}`, // `--env applicationPathOnHostMachine=${applicationPathOnHostMachine}`,
    `${'node:current'}`, // nodejs 12 to support nodegit
    `yarn run ${scriptCommandName}`,
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
  console.log(`• docker command: "${executableCommand.join(' ')}"`)
  const [command, ...commandArgument] = executableCommand
  spawnSync(command, commandArgument, option)
}
