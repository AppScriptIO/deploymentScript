import { convertWindowsPathToUnix } from '../../utility/convertWindowsPathToUnix.js'
// MANAGER APP
{
  // The applicationPathOnHostMachine is the path on the machine which docker client envoked manager app. In case of Docker for Windows, the path is a Windows path. While the path sent from a running container, should be refering to the hyper-v MobyLinuxVM (inside created by Docker for Windows are /host_mnt/c, with symlinks /c & /C).
  const applicationPathOnHostMachine = convertWindowsPathToUnix({ path: application.hostPath }) // change Windows path to Unix path - Note that using Unix / on Windows works perfectly inside nodejs, so there's no reason to stick to the Windows legacy at all.

  let image = 'myuserindocker/deployment-environment:simple_NodeDockerCompose', // this container should have docker client & docker-compose installed in.
    processCommand = 'docker',
    commandArgument = scriptManager.commandArgument,
    containerCommand = `node ${scriptManager.absolutePathInContainer} ${commandArgument.join(' ')}`,
    // containerBashCommand = `bash -c "${containerCommandCase1} || ${containerCommandCase2}"`,
    containerPrefix = 'scriptManager'

  let processArg = [
    `run`,
    `--rm`, // automatically remove after container exists.
    `--interactive --tty`, // allocate a terminal - this allows for interacting with the container process.
    `--volume ${application.hostPath}:${application.pathInContainer}`,
    // `--volume ${scriptManagerHostPath}:/project/scriptManager`,
    `--volume /var/run/docker.sock:/var/run/docker.sock`,
    `--volume ${operatingSystem.homedir()}/.ssh:/project/.ssh`,
    `--network=${networkName}`,
    `-P`,
    `--env applicationPathOnHostMachine=${applicationPathOnHostMachine}`,
    `--env sshUsername=${operatingSystem.userInfo().username}`,
    `--env PWD=${workingDirectoryInContainer_PWD}`, // pass PWD absolute path as in container (convert host machine path to container path)
    `--workdir ${workingDirectoryInContainer_CWD}`,
    `--env configurationPath=${configurationAbsoluteContainerPath}`, // pass the absolute path of the configuration file
  ]
    .concat(convertObjectToDockerEnvFlag(exportEnvironmentArg)) // pass all envrinment variables - causes issues as some variables like `PATH` are related to the executed script, therefore should be filtered beforehand.
    .concat([`--name ${containerPrefix}`, `${image}`, `${containerCommand}`])
  console.log(`%s \n %s \n %s`, `\x1b[3m\x1b[2m > ${processCommand} ${processArg.join(' ')}\x1b[0m`, `\t\x1b[3m\x1b[2mimage:\x1b[0m ${image}`, `\t\x1b[3m\x1b[2mcommand:\x1b[0m ${containerCommand}`)

  let childProcess = spawn(processCommand, processArg, {
    detached: false,
    shell: true,
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
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
    // if child process exits then remove all other running processes
    killChildProcess()
  })
}
