FROM node:25-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN yarn install --frozen-lockfile

FROM node:25-alpine AS production-dependencies-env
COPY ./package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile --production

FROM node:25-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN yarn build

FROM node:25-alpine
COPY ./package.json yarn.lock tsconfig.json server.ts sessionStorage.ts sockets.ts global-bundle.pem /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./app /app/app
COPY ./documentation /app/documentation
COPY ./public /app/public
WORKDIR /app
RUN node ./app/adapters.js
EXPOSE 5173
CMD ["yarn", "start"]
