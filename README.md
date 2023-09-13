# Willow Application Server Web UI

This repo contains the source code for the web user interface of the [Willow Application Server](https://github.com/toverainc/willow-application-server) (WAS). It is intended for developers who want to customize or contribute to the WAS web user interface.

I you're looking to get started with Willow, WAS, WIS, etc please visit our [Quick Start Guide](https://heywillow.io/quick-start-guide/).

## Getting Started

* Install and configure WAS (see quick start guide linked above)
* Clone this repo
* `cd willow-application-server-ui`
* `npm install`
* `npm run dev`

## Deploying changes

The WAS Web UI is still very early stage and these steps will be streamlined. In the meantime:
```bash
#If the backend is running on a remote instance you can set basepath with:
sed -i 's|const BASE_URL = ".*"|const BASE_URL = "http://YOUR_WAS_URL"|g' ./misc/fetchers.ts
npm run build
#output is in ./out directory & test with
cd ./out
../node_modules/.bin/http-server -c-1
```
