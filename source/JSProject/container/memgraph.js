const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

// Volumes for memgraph container:
// `-v mg_lib:/var/lib/memgraph -v mg_log:/var/log/memgraph -v mg_etc:/etc/memgraph`
export function runDockerContainer({
  localDNSHostname = 'memgraph' /** name in which other containers can access the container through in a custom network (as default doesn't support accessing using hostname) */,
} = {}) {
  try {
    // create network
    childProcess.execSync(
      `docker network create --driver bridge shared`, // use a custom network instead of the default bridge
      childProcessOption,
    )
  } catch (error) {
    console.log(`• Seems like the network already exists.`)
    // console.log(error) // log error and continue. Usually network already exists.
  }

  // when using network alias the container hostname should be added to the hosts manually for each container in the network
  // NOTE:  `--network-alias` works only when --network option is provided, and doesn't work for default bridge network. Additionally the alias is network bound, i.e. specifically to a single network.
  let command = [
    `docker create --name memgraph-shared --network shared --network-alias ${localDNSHostname} --publish 7687:7687 --restart always memgraph `,
    'docker network connect bridge memgraph-shared', // connect to default bridge network.
    `docker start memgraph-shared`,
  ].join(' && \\\n')

  console.log(`• Running container: memgraph on port 7687`)
  console.log(`$ ${command}`)

  try {
    childProcess.execSync(command, childProcessOption)
  } catch (error) {
    console.log(error)
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`)
  }
}
