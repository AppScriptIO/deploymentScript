import { spawn, spawnSync } from 'child_process'
import path from 'path'
import { parseKeyValuePairSeparatedBySymbolFromArray, combineKeyValueObjectIntoString } from '@dependency/parseKeyValuePairSeparatedBySymbol'
const message_prefix = `\x1b[3m\x1b[2m•[${path.basename(__filename)} JS script]:\x1b[0m`

console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ build`)

const projectName = 'scriptManager', // project name
  applicationHostPath = path.normalize(path.join(__dirname, '../../')),
  dockerComposeFilePath = path.join(__dirname, `../../container/containerDeployment.dockerCompose.yml`),
  namedArgs = parseKeyValuePairSeparatedBySymbolFromArray({ array: process.argv }), // all cli command arguments with "key=value" pair
  dockerYmlFileEnvironmentOption = [
    'entrypointConfigurationKey',
    'entrypointConfigurationPath',
    'targetAppBasePath',
    'dockerImageTag',
    'dockerImageTag_environment',
    'dockerImageTag_manager',
    'dockerhubUser',
    'dockerhubPass',
    'dockerImageName',
  ]

// filter cli namedArgs only from the options used by the script
let filteredNamedArgs = Object.keys(namedArgs)
  .filter(index => dockerYmlFileEnvironmentOption.includes(index))
  .reduce((obj, key) => {
    obj[key] = namedArgs[key]
    return obj
  }, {})

{
  // run container manager
  // # pull previously built image
  // # docker-compose -f $dockerComposeFilePath pull containerDeploymentManagement
  // # docker pull myuserindocker/deployment-environment:latest

  // # Check if docker image exists
  // # dockerImage=myuserindocker/deployment-environment:latest;
  // # if [[ "$(docker images -q $dockerImage 2> /dev/null)" == "" ]]; then
  //     dockerImage=node:latest
  // # fi;
  // export dockerImage;

  let dockerImage = 'node:latest',
    processCommand = 'docker-compose',
    serviceName = 'containerManager_run'

  let processArg = [`-f ${dockerComposeFilePath}`, `--project-name ${projectName}`, `up`, `--no-build`, `--force-recreate`, `--abort-on-container-exit`, `${serviceName}`],
    environmentVariable = Object.assign(
      {
        dockerImage,
        applicationHostPath,
      },
      filteredNamedArgs,
    )

  console.log(
    `%s \n %s \n %s \n %s \n %s `,
    `\x1b[3m\x1b[2m > ${processCommand} up \x1b[0m`,
    `\t\x1b[3m\x1b[2mimage:\x1b[0m ${dockerImage}`,
    `\t\x1b[3m\x1b[2mdockerComposeYmlPath:\x1b[0m ${dockerComposeFilePath}`,
    `\t\x1b[3m\x1b[2mserviceName:\x1b[0m ${serviceName}`,
    `\t\x1b[3m\x1b[2mprojectName:\x1b[0m ${projectName}`,
  )

  spawnSync(processCommand, processArg, {
    shell: true,
    stdio: [0, 1, 2],
    environmentVariable,
  })
}

{
  // stop and remove containers related to project name.
  let processCommand = 'docker-compose'
  console.log(
    `%s \n %s \n %s`,
    `\x1b[3m\x1b[2m > docker-compose down\x1b[0m \x1b[3m\x1b[2m(stop  running containers) output\x1b[0m`,
    `\t\x1b[3m\x1b[2mfile path:\x1b[0m ${dockerComposeFilePath}`,
    `\t\x1b[3m\x1b[2mprojectName:\x1b[0m ${projectName}`,
  )
  let processArg = [`-f ${dockerComposeFilePath}`, `--project-name ${projectName}`, `down`]
  spawnSync(processCommand, processArg, { shell: true, stdio: [0, 1, 2] })
}

console.groupEnd()
