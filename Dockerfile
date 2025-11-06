FROM node:25-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:25-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:25-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:25-alpine
COPY ./package.json package-lock.json tsconfig.json server.ts sessionStorage.ts sockets.ts global-bundle.pem /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
RUN node ./app/adapters.js
COPY ./app /app/app
COPY ./documentation /app/documentation
COPY ./public /app/public
WORKDIR /app
EXPOSE 5173
CMD ["npm", "run", "start"]
