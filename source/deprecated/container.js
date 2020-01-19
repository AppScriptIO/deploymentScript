import Docker from 'dockerode'

function docker() {
  const message_prefix = `\x1b[3m\x1b[2m•[${path.basename(__filename)} JS script]:\x1b[0m`

  console.group(`%s \x1b[33m%s\x1b[0m`, `${message_prefix}`, `ƒ sleep - container with volumes`)

  let image = 'node:latest',
    containerCommand = 'sleep 1000000',
    processCommand = 'docker',
    containerPrefix = 'sleepscriptManager',
    applicationHostPath = path.normalize(path.join(__dirname, '../'))

  let processArg = [
    `run`,
    // `--volume /var/run/docker.sock:/var/run/docker.sock`,
    `--volume ${applicationHostPath}:/project/application`,
    `--volume ${applicationHostPath}:/project/scriptManager`,
    `--env hostPath=${applicationHostPath}`,
    `--name ${containerPrefix}`,
    `${image}`,
    `${containerCommand}`,
  ]

  console.log(`%s \n %s \n %s`, `\x1b[3m\x1b[2m > ${processCommand} ${processArg.join(' ')}\x1b[0m`, `\t\x1b[3m\x1b[2mimage:\x1b[0m ${image}`, `\t\x1b[3m\x1b[2mcommand:\x1b[0m ${containerCommand}`)

  let cp = spawn(processCommand, processArg, { detached: false, shell: true, stdio: [0, 1, 2] })
  cp.on('error', function(err) {
    throw err
  })
  cp.unref() // prevent parent from waiting to child process and un reference child from parent's event loop.
  console.groupEnd()
}

function dockerCompose({ ymlFile = `${appDeploymentLifecycle}/deploymentContainer/development.dockerCompose.yml`, serviceName, containerPrefix }) {
  let containerCommand = 'sleep 1000000'
  let processCommand = 'docker-compose'
  let processArg = [`-f ${ymlFile}`, `--project-name ${containerPrefix}`, `run --service-ports --use-aliases`, `--entrypoint '${containerCommand}'`, `${serviceName}`]
  spawnSync(processCommand, processArg, { shell: true, stdio: [0, 1, 2] })
}

function dockerComposeLivereload({ ymlFile = '${appDeploymentLifecycle}/deploymentContainer/development.dockerCompose.yml', serviceName = 'nodejs', containerPrefix = 'app' }) {
  let appEntrypointPath =
    process.argv.includes('distribution') && false /* disable loading built serverSide entrypoint */ ? `${distributionServerSide}/entrypoint.js` : `${serverSidePath}/entrypoint.js`
  console.log(`App enrypoint path: ${appEntrypointPath}`)

  // when using `localhost` chrome shows the files in folders, while using `0.0.0.0` files appear as separated.
  // `0.0.0.0` allows access from any port (could be usful in containers as external connections not always referred to localhost it seems.)
  let debugCommand = process.argv.includes('debug') ? `--inspect${process.argv.includes('break') ? '-brk' : ''}=0.0.0.0:9229` : ''

  let containerCommand = process.argv.includes('livereload') ? `node ${debugCommand} ${appDeploymentLifecycle}/nodejsLivereload/ watch:livereload` : `node ${debugCommand} ${appEntrypointPath}`
  console.log(`• nodejs containerCommand = ${containerCommand}`)

  let environmentVariable = {
    DEPLOYMENT: 'development',
    SZN_DEBUG: debugCommand ? true : false,
    SZN_DEBUG_COMMAND: debugCommand,
    hostPath: process.env.hostPath,
  }
  if (process.argv.includes('distribution')) environmentVariable['DISTRIBUTION'] = true
  if (process.argv.includes('distribution'))
    Object.assign(environmentVariable, {
      SZN_OPTION_ENTRYPOINT_NAME: 'entrypoint.js',
      SZN_OPTION_ENTRYPOINT_PATH: path.join(configuration.directory.distributionPath, configuration.directory.serverSide.folderName),
    })

  // Run docker application container using yml configuration file.
  let processCommand = 'docker-compose',
    processCommandArgs = [`-f ${ymlFile}`, `--project-name ${containerPrefix}`, `run --service-ports --use-aliases`, `--entrypoint '${containerCommand}'`, `${serviceName}`],
    processOption = { /* cwd: `${applicationPath}`,*/ shell: true, stdio: [0, 1, 2], env: environmentVariable }
  spawnSync(processCommand, processCommandArgs, processOption)
}
