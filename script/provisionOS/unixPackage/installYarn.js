const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')
const isWsl = require('is-wsl')
const { sync: getBinaryPath } = require('which')
const filesystem = require('fs')

export function install() {
  let isCommandInstalled
  /* Check installation presence: The check for a command in linux doesn't diffrentiate from a command installed in WSL and command installed in Windows. As WSL shares Windows paths, where:
    The Windows Yarn command can be accessed from WSL which makes the check positive, even though no installation is present in the WSL side. Therefore a secondary check should be executed to verify that the binary isn't installed in WSL itself, regardless of wether it exists in Windows side.
  */
  // check environment - if WSL on Windows

  if (binaryExist('yarn') && isWsl) {
    // compare binary command path to Windows system, checking if the installation is on the Windows or WSL side.
    let binaryPath = getBinaryPath('yarn')
    let windowsSystemPath = childProcess
      .execSync(
        `windowsSystemPath="$( powershell.exe -NoProfile -NonInteractive -Command ' $drive=(Get-WmiObject Win32_OperatingSystem).SystemDrive; echo (-join($drive, "\\")) ' )" && echo $windowsSystemPath`,
        { cwd: __dirname, encoding: 'utf8' }, // to allow catching returned result
      )
      .replace(/\n$/, '')
      .trim() // remove new line and white space to prevent comparison issues
    let windowsSystemPathInWSL = childProcess
      .execSync(
        `windowsSystemPathInWSL="$( wslpath -u '${windowsSystemPath}')" && echo $windowsSystemPathInWSL`,
        { cwd: __dirname, encoding: 'utf8' }, // to allow catching returned result
      )
      .replace(/\n$/, '')
      .trim() // remove new line and white space to prevent comparison issues

    // Important note: In cases (e.g. calling script in subprocess or from powershell wsl.exe command) the binary path points to a temporary binary file that redirects to the windows location.
    let isWindowsInstallation =
      binaryPath.includes(windowsSystemPathInWSL) || (filesystem.existsSync(binaryPath) && filesystem.readFileSync(binaryPath, { encoding: 'utf8' }).includes(windowsSystemPathInWSL))
    // if command is installed in WSL side:
    isCommandInstalled = !isWindowsInstallation
  } else isCommandInstalled = binaryExist('yarn')

  if (isCommandInstalled) console.log('✔ yarn is installed.')
  else
    childProcess.execSync(
      [
        'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -',
        'echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list',
        'sudo apt-get -y update && sudo apt-get install -y yarn',
      ].join(' && \\\n'),
      childProcessOption,
    )
}

// Upgrade yarn -
// `curl -o- -L https://yarnpkg.com/install.sh | bash`
