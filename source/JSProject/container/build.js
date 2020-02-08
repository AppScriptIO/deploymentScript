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

export async function dockerBuildImage({ api /* supplied by scriptManager */ } = {}) {
  const targetProjectConf = api.project.configuration.configuration,
    targetProjectRoot = api.project.configuration.rootPath,
    targetPackagePath = path.join(targetProjectRoot, 'package.json'),
    targetTemporaryFolder = path.join(targetProjectRoot, 'temporary'),
    containerProjectPath = targetProjectRoot

  let packageConfig = modifyJson.readFileSync(targetPackagePath)

  let dockerFileConfig = [
    await generateDockerFile({
      // first stage - installation of package.json dependencies.
      from: 'node:current AS stage1',
      copy: {
        ['./']: '/project',
      },
      working_dir: '/project',
      // run: ['apt-get update -y && apt-get upgrade -y'],
      run: ['yarn', 'install', '--production'],
    }),
    await generateDockerFile({
      from: 'node:current',
      // Environment Variables & Arguments
      // default value is override if build argument is specified in docker compose.
      // args: ['PROJECT=/project', 'DEPLOYMENT=production'],
      // env: { PROJECT: '/project', DEPLOYMENT: 'production', EMAIL: '', LETSENCRYPT_PORT: '' },
      copy: {
        ['--from=stage1 /project']: '/project', // should copy code with node_modules installed from previous build stage.
      },
      working_dir: '/project',
      // entrypoint is for executable path only, and the arguments passed through command part. https://medium.com/@oprearocks/how-to-properly-override-the-entrypoint-using-docker-run-2e081e5feb9d
      entrypoint: 'yarn',
      cmd: ['run', 'run'],
    }),
  ].join('\n')
  // generate and write docker file from configs.
  let dockerFile = path.join(targetTemporaryFolder, 'build.dockerfile')
  filesystem.writeFileSync(dockerFile, dockerFileConfig)

  // --output --label
  let dockerBuildContext = targetProjectRoot
  let imageName = packageConfig.name.substring(packageConfig.name.lastIndexOf('/') + 1) |> convertToParamCase // package name `@namespace/packageName` => `packageName` => docker image name param case `package-name`
  let executableCommand = [['docker', `build --file ${dockerFile} --rm --no-cache --pull --tag ${imageName}:${packageConfig.version} ${targetProjectConf.directory.distribution}`].join(' ')]

  console.log(`• docker command: "${executableCommand.join(' ')}"`)
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
