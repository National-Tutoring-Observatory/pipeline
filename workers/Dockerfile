FROM node:25-alpine
COPY ./workers /app
COPY ./global-bundle.pem /app/
WORKDIR /app
RUN yarn install --frozen-lockfile --production
EXPOSE 4000
CMD ["yarn", "workers"]
