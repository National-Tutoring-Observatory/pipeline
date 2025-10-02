FROM node:20-alpine AS build-env
COPY . /app
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=build-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]