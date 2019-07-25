const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const { sync: binaryExist } = require('command-exists')

export function install() {
  if (binaryExist('yarn')) console.log('✔ yarn is installed.')
  else
    childProcess.execSync(
      `
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - && \\
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list && \\
    sudo apt-get -y update && sudo apt-get install -y yarn
  `,
      childProcessOption,
    )
}
