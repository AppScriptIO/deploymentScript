# last version used 9.3.0
FROM node:latest 
# RUN apt-get update -y; apt-get upgrade -y;

# Environment Variables & Arguments
# default value is override if build argument is specified in docker compose.


# project folder path 
ARG PROJECT="/project" 
ENV PROJECT=${PROJECT}

ARG DEPLOYMENT=production
ENV DEPLOYMENT ${DEPLOYMENT}

ENV EMAIL ${EMAIL}
# ENV LETSENCRYPT_PORT ${LETSENCRYPT_PORT}

COPY ./distribution $PROJECT/application/distribution
COPY ./setup $PROJECT/application/setup

WORKDIR $PROJECT/application/distribution/serverSide
ENTRYPOINT $PROJECT/application/distribution/serverSide/entrypoint.sh run