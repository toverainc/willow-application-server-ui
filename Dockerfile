ARG NODE_VER="18.18-bookworm-slim"

FROM node:${NODE_VER}
WORKDIR /was-ui
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

