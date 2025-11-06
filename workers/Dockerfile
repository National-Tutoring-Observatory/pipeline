FROM node:25-alpine
COPY ./workers /app
COPY ./global-bundle.pem /app/
WORKDIR /app
RUN npm ci --omit=dev
EXPOSE 4000
CMD ["npm", "run", "workers"]
