const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

export function runDockerContainer() {
  console.log(`• Running container: redisgraph on port 6379`)
  // TODO: This is a quick automatic starting of dependency container. Provide a better way to handle container dependencies.
  try {
    childProcess.execSync('docker run -p 6379:6379 -it --rm redislabs/redisgraph:latest', childProcessOption)
  } catch (error) {
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`)
  }
}
