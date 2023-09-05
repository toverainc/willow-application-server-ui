# Willow Application Server Web

This repo contains the source for willow-application-server-web. Backend code can be found at https://github.com/toverainc/willow-application-server/tree/main

## Running Local

* Run the backend
* `git clone git@github.com:zincio/willow-application-server-web.git`
* `cd willow-application-server-web`
* `npm install`
* `npm run dev`

## Deploying changes

Still TODO but you can build a static version of the UI with:
```bash
#If the backend is running on a remote instance you can set basepath with.
sed -i 's|const BASE_URL = ".*"|const BASE_URL = "https://YOUR_URL.io"|g' ./misc/fetchers.ts
npm run build
#output is in ./out directory & test with
cd ./out
../node_modules/.bin/http-server -c-1
```