// RETHINKDB
{
  let image = 'rethinkdb:latest', // this container should have docker client & docker-compose installed in.
    processCommand = 'docker',
    containerCommand = ``,
    containerPrefix = 'scriptManager_rehinkdb',
    networkAlais = 'rethinkdb'

  let processArg = [
    `run`,
    `--rm`, // automatically remove after container exists.
    // `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process.
    // `--volume ${application.hostPath}:${application.pathInContainer}`,
    `--network-alias ${networkAlais}`,
    `--network=${networkName}`,
    `-P `,
    // `-P`
  ].concat([`--name ${containerPrefix}`, `${image}`])
  console.log(`%s \n %s \n %s`, `\x1b[3m\x1b[2m > ${processCommand} ${processArg.join(' ')}\x1b[0m`, `\t\x1b[3m\x1b[2mimage:\x1b[0m ${image}`, `\t\x1b[3m\x1b[2mcommand:\x1b[0m ${containerCommand}`)

  let childProcess = spawn(processCommand, processArg, {
    // detached: false, shell: true, stdio: [ 'inherit', 'inherit', 'inherit', 'ipc' ],
    detached: false,
    shell: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    env: process.env, // pass environment variables like process.env.PWD to spawn process
  })
  childProcessArray.push(childProcess)
  // childProcess.unref() // prevent parent from waiting to child process and un reference child from parent's event loop.
  console.log(`\x1b[45m%s\x1b[0m`, `[NODE HOST MACHINE] PID: Child ${childProcess.pid}`)
  childProcess.on('error', function(err) {
    throw err
  })
  childProcess.on('exit', () => {
    console.log(`\x1b[41m%s\x1b[0m`, `[NODE HOST MACHINE] PID: Child ${childProcess.pid} terminated.`)
    spawnSync('docker', [`kill ${containerPrefix}`], {
      detached: false,
      shell: true,
      stdio: 'inherit',
      env: process.env, // pass environment variables like process.env.PWD to spawn process
    })
  })
}
