# Willow Application Server Web UI

This repo contains the source code for the web user interface of the [Willow Application Server](https://github.com/toverainc/willow-application-server) (WAS). It is intended for developers who want to customize or contribute to the WAS web user interface.

I you're looking to get started with Willow, WAS, WIS, etc please visit our [Quick Start Guide](https://heywillow.io/quick-start-guide/).

## Getting Started

- Install and configure WAS (see quick start guide linked above)
- Clone this repo
- `cd willow-application-server-ui`
- `npm install`
- `npm run dev`

## Deploying changes

To test changes in realtime, we can use utils.sh to build a docker container and then run it in order to see our changes:

```bash
./utils.sh build-docker
./utils.sh run
```

Note that for development when running this way, the UI runs on a dev http server at port 3000. Because of this, we need to point the UI to our real backend. To facilitate that, we can create a .env file and add the following entry to it:

```bash
NEXT_PUBLIC_WAS_URL=http://<your server name or ip>:8502
```

Once set, run the two commands above and the UI should now talk to your backend and pull data.

To deploy changes to your WAS server, we can add the following to our .env file:

```bash
WAS_DIR=<path to your WAS>
```

NOTE: If you added the NEXT_PUBLIC_WAS_URL in the previous example, you would want to remove it before deploying as it will get deployed with Next.
Once the above is added, run the following to deploy:

```bash
./utils.sh build-docker
./utils.sh build
```

Note that for this to work, you need to be running the feature/was-web-ui branch of WAS.
