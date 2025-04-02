#!/bin/bash
set -e

TAG="willow-application-server-ui:latest"
NEXT_DEV_PORT="3000"

NAME="wasui"

if [ -r .env ]; then
    echo "Using configuration overrides from .env file"
    . .env
fi

user_env() {
    case $1 in

        disable)
            if [ -f .env ]; then
                echo "Disabling user .env"
                mv .env .env.dis
            fi
        ;;

        enable)
            if [ -f .env.dis ]; then
                echo "Enabling user .env"
                mv .env.dis .env
            fi
        ;;

    esac
}

case $1 in

build)
    # Hack to not include our environment in build
    user_env disable
    docker run --rm -it -v "$PWD":/was-ui --name "$NAME" "$TAG" npm run build
    user_env enable
    if [ "$WAS_DIR" ]; then
        for i in $WAS_DIR; do
            WAS_ADMIN_DIR="$i/static/admin"
            echo "Copying Next build to $WAS_ADMIN_DIR"
            mkdir -p "$WAS_ADMIN_DIR"
            rsync -a --delete out/* "$WAS_ADMIN_DIR"/
        done
    fi
;;

build-docker|docker-build)
    docker build -t "$TAG" -f Dockerfile .
;;

install)
    docker run --rm -it -v "$PWD":/was-ui --name "$NAME" "$TAG" npm install
;;

run)
    echo "Use HTTP port $NEXT_DEV_PORT to access development server"
    docker run --rm -it -v "$PWD":/was-ui --name "$NAME" -p "$NEXT_DEV_PORT":3000 "$TAG" npm run dev
;;

*)
    echo "Passing unknown argument directly to container"
    docker run --rm -it -v "$PWD":/was-ui --name "$NAME" -p "$NEXT_DEV_PORT":3000 "$TAG" "$@"
;;

esac
