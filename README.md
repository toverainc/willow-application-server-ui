# Willow Application Server Web UI

This repo contains the source code for the web user interface of the [Willow Application Server](https://github.com/HeyWillow/willow-application-server) (WAS). It is intended for developers who want to customize or contribute to the WAS web user interface.

If you're looking to get started with Willow, WAS, WIS, etc please visit our [Quick Start Guide](https://heywillow.io/quick-start-guide/).

## Development

To test changes in realtime we can use utils.sh to build a docker container and then run it to see changes in realtime:

```bash
./utils.sh build-docker
./utils.sh run
```

Note that for development the UI runs a dev http server on port 3000 by default. To communicate with WAS you need to point the UI to your WAS instance. Do so by creating a `.env` file and add:

```bash
NEXT_PUBLIC_WAS_URL=http://<your server name or ip>:8502
```

## Build and deploy

To deploy changes to your WAS server add the following to your `.env` file:

```bash
WAS_DIR=<path to your WAS>
```

Run the following to build and deploy:

```bash
./utils.sh build
```
