const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

// Swarmpit - GUI for docker swarm management.
export function runDockerContainer() {
  try {
    let executableCommand = [
      // `docker volume create swarmpit-data`,
      ['docker run -it --rm', `--name swarmpit-installer`, `--volume /var/run/docker.sock:/var/run/docker.sock`, 'swarmpit/install:1.8'].join(' '),
    ]

    let command = executableCommand.join(' && \\\n')
    console.log(`• Running container: Swarmpit container on port 9000 - Command: \n"${command}"`)
    childProcess.execSync(command, childProcessOption)
  } catch (error) {
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`)
  }
}
