FROM node:25-alpine
COPY package.json yarn.lock global-bundle.pem tsconfig.json tsconfig.server.json ./app/
COPY workers/package.json ./app/workers/
COPY ./workers ./app/workers
COPY ./app /app/app
WORKDIR /app
RUN apk add --no-cache yarn
ENV REDISMS_DISABLE_POSTINSTALL=1
RUN yarn install --frozen-lockfile --production
EXPOSE 4000
CMD ["yarn", "workers:prod"]
