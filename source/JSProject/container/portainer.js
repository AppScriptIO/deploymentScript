const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

// Volumes for memgraph container:
// `-v mg_lib:/var/lib/memgraph -v mg_log:/var/log/memgraph -v mg_etc:/etc/memgraph`
export function runDockerContainer() {
  console.log(`• Running container: portainer container on port 9000`)
  // TODO: This is a quick automatic starting of dependency container. Provide a better way to handle container dependencies.
  try {
    let executableCommand = [
      'docker',
      'run',
      '--name portainer',
      '--restart', // always restart even after docker restart
      '--port 9000:9000',
      '--volume /var/run/docker.sock:/var/run/docker.sock',
      '--volume portainer_data:/data', // named volume is created in the contaxt of Docker directory of the host filesystem
      '-d portainer/portainer',
      '-H unix:///var/run/docker.sock --no-auth', // disbale internal password mechanism that is used by portainer for extra security. i.e. no required password for logging into admin interface.
    ]
    childProcess.execSync(executableCommand.join(' && \\\n'), childProcessOption)
  } catch (error) {
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`)
  }
}
