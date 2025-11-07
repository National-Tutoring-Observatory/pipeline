FROM node:25-alpine AS production-dependencies-env
COPY ./package.json yarn.lock /srv/
WORKDIR /srv
RUN yarn install --frozen-lockfile --production


FROM production-dependencies-env AS build-env
RUN yarn install --frozen-lockfile
COPY . /srv/
WORKDIR /srv
RUN yarn app:build


FROM node:25-alpine
COPY ./package.json yarn.lock tsconfig.json server.ts sessionStorage.ts sockets.ts global-bundle.pem /srv/
COPY --from=production-dependencies-env /srv/node_modules /srv/node_modules
COPY --from=build-env /srv/build /srv/build
COPY ./app /srv/app
COPY ./documentation /srv/documentation
COPY ./public /srv/public
WORKDIR /srv
RUN node ./app/adapters.js
EXPOSE 5173
CMD ["yarn", "app:prod"]
