const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

export function runDockerContainer() {
  try {
    let executableCommand = [
      `docker volume create portainer_data`,
      [
        'docker',
        'run',
        '--name portainer',
        '--restart always', // always restart even after docker restart
        '-p 9000:9000',
        '--volume /var/run/docker.sock:/var/run/docker.sock',
        '--volume portainer_data:/data', // named volume is created in the contaxt of Docker directory of the host filesystem
        '-d portainer/portainer',
        '-H unix:///var/run/docker.sock --no-auth', // disbale internal password mechanism that is used by portainer for extra security. i.e. no required password for logging into admin interface.
      ].join(' '),
    ]

    let command = executableCommand.join(' && \\\n')
    console.log(`• Running container: portainer container on port 9000 - Command: \n"${command}"`)
    childProcess.execSync(command, childProcessOption)
  } catch (error) {
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`)
  }
}
