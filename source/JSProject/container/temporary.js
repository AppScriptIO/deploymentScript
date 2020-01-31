{
  let childProcess = spawn(processCommand, processCommandArgs, processOption)
  childProcess.on('error', err => throw err)
  childProcess.on('exit', () => console.log(`PID: Child ${childProcess.pid} terminated.`))
  childProcess.unref() // prevent parent from waiting to child process and un reference child from parent's event loop.
  childProcess.on('exit', () => {
    spawnSync('docker', [`kill ${containerPrefix}`], {
      detached: false,
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: process.env, // pass environment variables like process.env.PWD to spawn process
    })
  })
  console.log(`PID: Child ${childProcess.pid}`)
  process.on('SIGINT', () => {
    // when docker is using `-it` option this event won't be fired in this process, as the SIGINT signal is passed directly to the docker container.
    childProcess.kill('SIGINT')
  })
}

{
  /** docker-compose */
  ;`docker-compose -f ${ymlFile} up -d --no-build --force-recreate --abort-on-container-exit ${serviceName}`
  ;`docker-compose -f ${ymlFile} build --no-cache ${serviceName}`
  ;[
    'docker-compose',
    `-f ${ymlFile}`,
    `--project-name ${containerPrefix}`,
    `run --service-ports --use-aliases`, // --service-ports is required when using run command, it allows mapping of ports to host as set in yml file.
    `--entrypoint '${containerCommand}'`, // `node script.js`
    `${serviceName}`,
  ]
  ;['docker-compose', `-f ${ymlFile}`, `--project-name ${projectName}`, `down`] // stop and remove containers related to project name.
  ;`docker-compose -f $dockerComposeFilePath pull containerDeploymentManagement` // pull previously built image
  ;`docker pull myuserindocker/deployment-environment:latest` // pull image

  /** docker network */
  ;['docker', `network create ${networkName}`]
}

// Check if docker image exists
;`
    dockerImage=myuserindocker/deployment-environment:latest;
    if [[ "$(docker images -q $dockerImage 2> /dev/null)" == "" ]]; then
        dockerImage=node:latest
    fi;
  `
