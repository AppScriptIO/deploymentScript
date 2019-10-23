const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

// Volumes for memgraph container:
// `-v mg_lib:/var/lib/memgraph -v mg_log:/var/log/memgraph -v mg_etc:/etc/memgraph`
export function runDockerContainer() {
  childProcess.execSync('docker run -p 7687:7687 -d memgraph', childProcessOption)
}
