const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

// Volumes for memgraph container:
// `-v mg_lib:/var/lib/memgraph -v mg_log:/var/log/memgraph -v mg_etc:/etc/memgraph`
export function runDockerContainer() {
  console.log(`• Running container: memgraph on port 7687`)
  // TODO: This is a quick automatic starting of dependency container. Provide a better way to handle container dependencies.
  try {
    childProcess.execSync('docker run -p 7687:7687 -d memgraph', childProcessOption)
  } catch (error) {
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`)
  }
}
