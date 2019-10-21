const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

// Installed globally for usage with VSCode extension
export function npmInstall() {
  if (binaryExist('jshint')) console.log('✔ jshint (npm package) is installed.')
  else childProcess.execSync('yarn install -g jshint', childProcessOption)
}
