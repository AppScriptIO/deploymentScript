container.development() { # ⭐
    # DOESN'T WORK
    # fix issue caused by virtualbox & Windows apparently that don't support sync directory - https://forums.docker.com/t/issues-with-rethinkdb-example-using-volumes/13720/4
    # Download exe and run exe - https://www.rethinkdb.com/docs/install/windows/
    # grab the files created in new directory to the volume that will be mounted to the container.

    # 1. Hosts local development environment
    # http://serverfault.com/questions/115282/can-i-configure-the-windows-hosts-file-to-use-ip-address-plus-port
    # map 'cdn.localhost' & 'api.localhost' to localhost:8081 & localhost:8082 respectively
    # Using Fiddler (because hosts file doesn't support mapping to ports.) in Tool -> HOSTS:
    # localhost:8081      cdn.localhost
    # localhost:8082      api.localhost

    # 2. connect to VM
    VM=machine
    eval $(docker-machine env $VM)

    # 3. 
    export DEPLOYMENT=development # development also for distribution. as the environment run is development and doesn't have global variables like HOST which is used for production server.
    docker-compose \
        -f ./setup/container/development.dockerCompose.yml \
        --project-name talebwebapp \
        up -d --force-recreate

    # 4. Run services using gulp inside container
    VM=machine
    docker-machine ssh $VM
    dockerContainerID=""
    docker exec -it $dockerContainerID bash
    (cd $applicationPath/setup/build/; ./entrypoint.sh development)
}

container.deployment.buildDistribution() { # ⭐
    # development / production
    export DEPLOYMENT=production
    docker-compose \
        -f ./setup/container/deployment.dockerCompose.yml \
        --project-name talebwebapp_distribution \
        up buildDistributionCode
}

container.deployment.buildImage() { # ⭐
    # 1. development / production
    export DEPLOYMENT=production
    # export DEPLOYMENT=development
    # export COMPOSE_PROJECT_NAME= # Not needed as name is taken from image field.

    # 2. Build Source Code:
    ./setup/entrypoint.sh container.deployment.buildDistribution

    # 3.
    # Problem cannot pass arguments to dockerfile
    docker-compose \
        -f ./setup/container/deployment.dockerCompose.yml \
        --project-name talebwebapp_build \
        build --no-cache buildImage

    # 4. tag image and 
    docker tag <image>:latest <image>:1.0.0
    docker-machine ssh machine
    docker login
    docker push <image>:1.0.0
}