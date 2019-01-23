#!/usr/bin/env bash

### Loads the project in a nodejs container ready to be used.

currentRelativeFilePath=$(dirname "$0")
# pwd - current working directory in host machine.
# currentRelativeFilePath - path relative to where shell was executed from.
# hostPath - will be used when calling docker-compose from inside 'manager' container to point to the host VM path rather than trying to mount from manager container. as mounting volumes from other container causes issues.
projectRootPath="`pwd`/$currentRelativeFilePath/" # Assuming that the cwd is in the root project.
echo host path: $projectRootPath

docker run \
    --name javascriptTranspilation \
    --volume $projectRootPath:/project/application \
    --volume $HOME/.ssh:/project/.ssh \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --env "hostPath=$projectRootPath" \
    --env "sshUsername=$(whoami)" \
    -it \
    node:latest \
    bash && sleep 19999999
