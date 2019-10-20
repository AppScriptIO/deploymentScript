const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

export function install() {
  if (binaryExist('git')) console.log('✔ git is installed.')
  else childProcess.execSync('sudo apt install git', childProcessOption)
}
