const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const childProcess = require('child_process')
const { sync: binaryExist } = require('command-exists')

/* Install docker client: https://davidburela.wordpress.com/2018/06/27/running-docker-on-wsl-windows-subsystem-for-linux/
  After which docker command will run WSL Docker Client to Windows Docker Engine
  ```WSL
  docker ps 
  ```
*/
export function install() {
  if (binaryExist('docker')) console.log('✔ docker is installed.')
  else
    childProcess.execSync(
      [
        `sudo apt-get update -y && sudo apt-get upgrade -y`,
        `sudo apt-get install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common`,
        `curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -`,
        `sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable nightly"`,
        `sudo apt-get update -y`,
        `sudo apt-get install -y docker-ce docker-ce-cli containerd.io`,
        `sudo usermod -aG docker $USER`,
        // If this variable doesn't persist between PC reboots, then add `export DOCKER_HOST=tcp://127.0.0.1:2375` to .bashrc or the current shell config file, so it will run each time shell is initialized.
        `export DOCKER_HOST=tcp://127.0.0.1:2375`,
      ].join(' && \\\n'),
      childProcessOption,
    )
}
