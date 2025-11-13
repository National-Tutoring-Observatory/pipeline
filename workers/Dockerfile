FROM node:25-alpine
WORKDIR /app
COPY package.json yarn.lock ./
COPY workers/package.json ./workers/
COPY ./global-bundle.pem ./
RUN npm install -g yarn
RUN yarn install --frozen-lockfile --production
COPY ./workers ./workers/
EXPOSE 4000
CMD ["yarn", "workers:prod"]
