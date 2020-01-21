// for development to check the image or try to install packages on it before writting it to the code of the build.
import { spawn, spawnSync } from 'child_process'
import path from 'path'
const message_prefix = `\x1b[3m\x1b[2m•[${path.basename(__filename)} JS script]:\x1b[0m`

console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ run - container with volumes`)

let image = 'myuserindocker/deployment-environment:latest',
  containerCommand = 'node /project/application/source/entrypoint.js run',
  processCommand = 'docker',
  containerPrefix = 'sleepscriptManager',
  applicationHostPath = path.normalize(path.join(__dirname, '../../'))

console.log(`%s \n %s \n %s`, `\x1b[3m\x1b[2m > docker run\x1b[0m`, `\t\x1b[3m\x1b[2mimage:\x1b[0m ${image}`, `\t\x1b[3m\x1b[2mcommand:\x1b[0m ${containerCommand}`)

let processArg = [
  `run`,
  `--volume /var/run/docker.sock:/var/run/docker.sock`,
  `--volume ${applicationHostPath}:/project/application`,
  `--volume ${applicationHostPath}:/project/scriptManager`,
  `--env "hostPath=${applicationHostPath}"`,
  `--env "entrypointConfigurationPath=/project/application/setup/entrypoint/configuration.js"`,
  `--name ${containerPrefix}`,
  `${image}`,
  `${containerCommand}`,
]
// spawnSync(processCommand, processArg, { shell: true, stdio: [0,1,2] })

console.groupEnd()
