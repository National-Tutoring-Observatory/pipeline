FROM node:25-alpine
COPY ./workers /app/
RUN npm ci --omit=dev
COPY ./global-bundle.pem /app/
WORKDIR /app
EXPOSE 4000
CMD ["npm", "run", "workers"]
