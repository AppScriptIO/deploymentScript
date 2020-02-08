import { execSync, spawn, spawnSync } from 'child_process'
import operatingSystem from 'os'
import path from 'path'
import filesystem from 'fs'
import assert from 'assert'
import { generate as generateDockerFile } from 'dockerfile-generator'
import modifyJson from 'jsonfile'
import { paramCase as convertToParamCase } from 'param-case'

// .yaml

// buildImage:
//   build:
//       context: ../../../ # change context to project's root folder.
//       dockerfile: /project/application/dependency/appDeploymentLifecycle/deploymentContainer/service.dockerfile
//       args:
//           - DEPLOYMENT=${DEPLOYMENT:-production}
//           - DISTRIBUTION=${DISTRIBUTION}
//   image: myuserindocker/${imageName}:latest # tag for created/built image # name of local image to be built

// docker-compose
// `pull containerDeploymentManagement` // pull previously built image

export async function dockerBuild({ api /* supplied by scriptManager */ } = {}) {
  const targetProjectConf = api.project.configuration.configuration,
    targetProjectRoot = api.project.configuration.rootPath,
    targetPackagePath = path.join(targetProjectRoot, 'package.json'),
    targetTemporaryFolder = path.join(targetProjectRoot, 'temporary'),
    containerProjectPath = targetProjectRoot

  let packageConfig = modifyJson.readFileSync(targetPackagePath)

  let dockerFileConfig = {
    from: 'node:current',
    // run: ['apt-get update -y && apt-get upgrade -y'],

    // Environment Variables & Arguments
    // default value is override if build argument is specified in docker compose.
    // args: ['PROJECT=/project', 'DEPLOYMENT=production'],
    // env: { PROJECT: '/project', DEPLOYMENT: 'production', EMAIL: '', LETSENCRYPT_PORT: '' },

    copy: {
      [targetProjectConf.directory.distribution]: '/project',
    },

    working_dir: '/project',
    entrypoint: 'yarn run run',
  }
  // generate and write docker file from configs.
  let dockerFile = path.join(targetTemporaryFolder, 'build.dockerfile')
  filesystem.writeFileSync(dockerFile, await generateDockerFile(dockerFileConfig))

  // --output --label
  let dockerBuildContext = targetProjectRoot
  let imageName = packageConfig.name.substring(packageConfig.name.lastIndexOf('/') + 1) |> convertToParamCase // package name `@namespace/packageName` => `packageName` => docker image name param case `package-name`
  let executableCommand = [['docker', `build --file ${dockerFile} --rm --no-cache --pull --tag ${imageName}:${packageConfig.version} ${dockerBuildContext}`].join(' ')]

  let option = {
    cwd: targetProjectRoot,
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
