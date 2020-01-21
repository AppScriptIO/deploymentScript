// ❗ Should refactor - doesn't work.

// run container manager with requested command.
const message_prefix = `\x1b[3m\x1b[2m•[${path.basename(__filename)} JS script]:\x1b[0m`
console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ container manager - container with volumes & requested entrypoint script`)

import path from 'path'
import { runInContainer } from '../..' // own package (@dependency/appDeploymentManager)
const ownRootPath = path.dirname(require.resolve('../package.json')) // own package root path

runInContainer({
  applicationHostPath: path.normalize(path.join(__dirname, '../..')),
  scriptManagerHostPath: appDeploymentManagerPath,
})
