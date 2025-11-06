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
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./tsconfig.json /app/
COPY ./server.ts /app/
COPY ./sessionStorage.ts /app/
COPY ./sockets.ts /app/
COPY ./global-bundle.pem /app/
COPY ./documentation /app/documentation
COPY ./public /app/public
WORKDIR /app
EXPOSE 5173
CMD ["npm", "run", "start"]
