{
  /** docker-compose */
  ;`docker-compose -f ${ymlFile} up -d --no-build --force-recreate --abort-on-container-exit ${serviceName}`
  ;['docker-compose', `-f ${ymlFile}`, `--project-name ${projectName}`, `down`] // stop and remove containers related to project name.
  ;`docker-compose -f ${ymlFile} build --no-cache ${serviceName}`
  ;[
    'docker-compose',
    `-f ${ymlFile}`,
    `--project-name ${containerPrefix}`,
    `run --service-ports --use-aliases`, // --service-ports is required when using run command, it allows mapping of ports to host as set in yml file.
    `--entrypoint '${containerCommand}'`,
    `${serviceName}`,
  ]
  ;`docker-compose -f $dockerComposeFilePath pull containerDeploymentManagement` // pull previously built image
}

// Check if docker image exists
;`
  dockerImage=myuserindocker/deployment-environment:latest;
  if [[ "$(docker images -q $dockerImage 2> /dev/null)" == "" ]]; then
      dockerImage=node:latest
  fi;
`
