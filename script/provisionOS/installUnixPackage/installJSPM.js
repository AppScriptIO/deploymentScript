const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')
const assert = require('assert')

export function install() {
  assert(binaryExist('yarn'), `• jspm installation is dependent on 'yarn' binary existance.`)
  if (binaryExist('jspm')) console.log('✔ jspm is installed.')
  else childProcess.execSync(`yarn global add jspm`, childProcessOption)
}
