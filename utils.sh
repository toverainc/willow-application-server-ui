#!/bin/bash

TAG="willow-application-server-ui:latest"
NEXT_DEV_PORT="3000"

if [ -r .env ]; then
    echo "Using configuration overrides from .env file"
    . .env
fi

case $1 in

build-docker|docker-build)
    docker build -t "$TAG" -f Dockerfile.dev .
;;

run)
    echo "Use HTTP port $NEXT_DEV_PORT to access development server"
    docker run --rm -it -v "$PWD":/was-ui -p "$NEXT_DEV_PORT":3000 "$TAG"
;;

esac