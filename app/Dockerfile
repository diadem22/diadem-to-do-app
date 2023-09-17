FROM node:14-alpine

WORKDIR /app

COPY ./app/package.json ./

RUN npm install

COPY ./app ./

CMD ["node", "app.js"]

