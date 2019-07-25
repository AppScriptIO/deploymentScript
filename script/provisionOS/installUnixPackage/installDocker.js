const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

export function install() {
  if (binaryExist('docker')) console.log('✔ docker is installed.')
  else
    childProcess.execSync(
      `
  sudo apt-get update -y && sudo apt-get upgrade -y \\
  sudo apt-get install -y \\
  apt-transport-https \\
  ca-certificates \\
  curl \\
  gnupg2 \\
  software-properties-common && \\
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add - && \\
  sudo add-apt-repository \\
  "deb [arch=amd64] https://download.docker.com/linux/debian \\
  $(lsb_release -cs) \\
  stable nightly" && \\
  sudo apt-get update -y && \\
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io && \\
  export DOCKER_HOST=tcp://127.0.0.1:2375
`,
      childProcessOption,
    )
}
