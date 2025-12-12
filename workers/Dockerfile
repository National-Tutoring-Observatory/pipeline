FROM node:25-alpine
RUN apk add --no-cache yarn
COPY package.json yarn.lock global-bundle.pem tsconfig.json /app/
COPY workers/package.json /app/workers/
WORKDIR /app
ENV REDISMS_DISABLE_POSTINSTALL=1
RUN yarn install --frozen-lockfile --production
COPY ./workers ./workers
COPY ./app ./app
RUN node ./app/adapters.js
EXPOSE 4000
CMD ["yarn", "workers:prod"]
