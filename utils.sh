#!/bin/bash
set -e

TAG="willow-application-server-ui:latest"
NEXT_DEV_PORT="3000"

if [ -r .env ]; then
    echo "Using configuration overrides from .env file"
    . .env
fi

case $1 in

build)
    docker run --rm -it -v "$PWD":/was-ui "$TAG" npm run build
    if [ "$WAS_DIR" ]; then
        WAS_ADMIN_DIR="$WAS_DIR/static/admin"
        echo "Copying admin Next build to $WAS_ADMIN_DIR"
        mkdir -p "$WAS_ADMIN_DIR"
        rsync -aP --delete out/* "$WAS_ADMIN_DIR"/
    fi
;;

build-docker|docker-build)
    if ["$NEXT_PUBLIC_WAS_URL" ]; then
        NEXT_PUBLIC_WAS_URL="$NEXT_PUBLIC_WAS_URL"
    fi
    docker build -t "$TAG" -f Dockerfile.dev .
;;

run)
    echo "Use HTTP port $NEXT_DEV_PORT to access development server"
    docker run --rm -it -v "$PWD":/was-ui -p "$NEXT_DEV_PORT":3000 "$TAG"
;;

esac