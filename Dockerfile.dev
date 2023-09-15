FROM node:lts as builder
ARG GIT_COMMIT
WORKDIR /my-project
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .

FROM node:lts as runner
WORKDIR /my-project
ENV NODE_ENV=production

# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /my-project/next.config.js ./
COPY --from=builder /my-project/public ./public
COPY --from=builder /my-project/.next ./.next
COPY --from=builder /my-project/node_modules ./node_modules
COPY --from=builder /my-project/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
