FROM node:25-alpine AS development-dependencies-env
RUN apk add --no-cache yarn
COPY ./package.json yarn.lock /app/
WORKDIR /app
ENV REDISMS_DISABLE_POSTINSTALL=1
RUN yarn install --frozen-lockfile

FROM node:25-alpine AS production-dependencies-env
RUN apk add --no-cache yarn
COPY ./package.json yarn.lock /app/
WORKDIR /app
ENV REDISMS_DISABLE_POSTINSTALL=1
RUN yarn install --frozen-lockfile --production

FROM node:25-alpine AS build-env
RUN apk add --no-cache yarn
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY . /app/
WORKDIR /app
RUN yarn app:build

FROM node:25-alpine
RUN apk add --no-cache yarn
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./package.json yarn.lock tsconfig.json server.ts sessionStorage.ts sockets.ts global-bundle.pem /app/
COPY ./app /app/app
COPY ./documentation /app/documentation
COPY ./public /app/public
WORKDIR /app
RUN node ./app/adapters.js
EXPOSE 5173
CMD ["yarn", "app:prod"]
