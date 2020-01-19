import path from 'path'
const { execSync, spawn, spawnSync } = require('child_process')
const deploymentScriptPath = path.dirname(require.resolve('@dependency/deploymentScript/package.json')),
  javascriptTestRunnerPath = path.normalize(`${__dirname}/../entrypoint/cli/transpilation.entrypoint.js`)

/*
 * Usage:
 * • ./entrypoint.sh test unitTest
 * • ./entrypoint.sh test unitTest debug
 * • ./entrypoint.sh test unitTest path=<pathToFile>/entrypoint.test.js // single test file execution.
 */
export function unitTest(
  input,
  // When running inside container, docker client communicates with MobeyLinuxVM on Windows host machine, and the volume paths will be related or referencing to the hyper-v MobyLinuxVM vm. In it here is a folder /host_mount/c that corresponds to the Widnows host filesystem drive.
  // when variable names are similar declaring the variable and assigning it in the first object causes not defined ReferenceError.
) {
  let configuration,
    container = {},
    nodeFlag = {},
    testRunnerModulePath,
    testPath,
    applicationPathOnHostMachine
  ;({
    configuration,
    container = {
      imageName: (container.imageName = configuration.dockerImageName),
      ymlFile: (container.ymlFile = `${deploymentScriptPath}/deploymentContainer/deployment.dockerCompose.yml`),
    },
    nodeFlag = {
      debug: (nodeFlag.debug = null),
      break: (nodeFlag.break = null),
    },
    testRunnerModulePath = javascriptTestRunnerPath, // path of the module that includes the test framework.
    testPath = configuration.directory.testPath, // path to test directory.
    applicationPathOnHostMachine = path.join(configuration.directory.projectPath, 'application'), // this path should be already resolved to Unix path from Windows path including the drive letter, which will be used in MobyLinuxVM.
  } = input) // destructure nested objects to the object properties themselves.

  let serviceName = 'nodejs',
    containerPrefix = 'app_test'

  console.log(`\x1b[33m\x1b[1m\x1b[7m\x1b[36m%s\x1b[0m \x1b[2m\x1b[3m%s\x1b[0m`, `Running Container:`, `NodeJS App`)
  let debugCommand = nodeFlag.debug ? `--inspect${nodeFlag ? '-brk' : ''}=0.0.0.0:9229` : ''
  let appEntrypointPath = testRunnerModulePath
  let firstNodeCommand = testPath // command passed to node module environment
  // Print container title
  // let printMessageNodeCommand = `node --eval "console.log(String(/${containerStartupMessage}/).substring(1).slice(0,-1))"` // String(/Allows to write string without qoutes/).substring(1).slice(0,-1) // qoutes are being stripped for some reason, probably by docker-compose.
  let containerCommand = `node ${debugCommand} ${appEntrypointPath} ${firstNodeCommand}`

  let environmentVariable = {
    DEPLOYMENT: 'development',
    SZN_DEBUG: false,
    applicationPathOnHostMachine,
    imageName: container.imageName,
  }
  let processCommand = 'docker-compose',
    processCommandArgs = [`-f ${container.ymlFile}`, `--project-name ${containerPrefix}`, `run --service-ports --use-aliases`, `--entrypoint "${containerCommand}"`, `${serviceName}`],
    processOption = {
      // cwd: `${applicationPathOnHostMachine}`,
      shell: true,
      detached: false,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: Object.assign(
        process.env, // PATH environment variable is required for docker-composer to run.  PATH - specifies the directories in which executable programs
        environmentVariable,
      ),
    }
  console.log(`%s %s`, processCommand, processCommandArgs.join(' '))
  let childProcess = spawn(processCommand, processCommandArgs, processOption)
  childProcess.on('error', function(err) {
    throw err
  })
  childProcess.on('exit', () => {
    console.log(`PID: Child ${childProcess.pid} terminated.`)
  })
  // childProcess.unref() // prevent parent from waiting to child process and un reference child from parent's event loop.
  console.log(`PID: Child ${childProcess.pid}`)
  process.on('SIGINT', () => {
    // when docker is using `-it` option this event won't be fired in this process, as the SIGINT signal is passed directly to the docker container.
    console.log('• Caught interrupt signal - host machine level')
    childProcess.kill('SIGINT')
  })
}
