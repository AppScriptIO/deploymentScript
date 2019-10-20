const childProcess = require('child_process')
const assert = require('assert')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

export function install() {
  assert(binaryExist('yarn'), `• jspm installation is dependent on 'yarn' binary existance.`)
  if (binaryExist('jspm')) console.log('✔ jspm is installed.')
  else childProcess.execSync(`yarn global add jspm`, childProcessOption)
}
