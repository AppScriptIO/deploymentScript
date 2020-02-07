
// .yaml
 
// buildImage:
//   build:
//       context: ../../../ # change context to project's root folder.
//       dockerfile: /project/application/dependency/appDeploymentLifecycle/deploymentContainer/service.dockerfile
//       args:
//           - DEPLOYMENT=${DEPLOYMENT:-production}
//           - DISTRIBUTION=${DISTRIBUTION}
//   image: myuserindocker/${imageName}:latest # tag for created/built image # name of local image to be built



// // .dockerfile 

// FROM node:latest 
// # RUN apt-get update -y; apt-get upgrade -y;

// # Environment Variables & Arguments
// # default value is override if build argument is specified in docker compose.

// # project folder path 
// ARG PROJECT="/project" 
// ENV PROJECT=${PROJECT}

// ARG DEPLOYMENT=production
// ENV DEPLOYMENT ${DEPLOYMENT}

// ENV EMAIL ${EMAIL}
// ENV LETSENCRYPT_PORT ${LETSENCRYPT_PORT}

// COPY ./distribution $PROJECT

// WORKDIR $PROJECT
// ENTRYPOINT $PROJECT/run.sh