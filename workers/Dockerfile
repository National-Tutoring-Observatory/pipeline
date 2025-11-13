FROM node:25-alpine
WORKDIR /app
COPY package.json yarn.lock ./
COPY workers/package.json ./workers/
COPY ./global-bundle.pem ./
RUN apk add --no-cache yarn
ENV REDISMS_DISABLE_POSTINSTALL=1
RUN yarn install --frozen-lockfile --production
COPY ./workers ./workers/
EXPOSE 4000
CMD ["yarn", "workers:prod"]
