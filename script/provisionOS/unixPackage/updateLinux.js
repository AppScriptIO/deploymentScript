const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }
const childProcess = require('child_process')

export function updateAndUpgrade() {
    childProcess.execSync([
      `sudo apt update -y`,
      `sudo apt upgrade -y`
    ].join(' && \\\n'), childProcessOption)
}
