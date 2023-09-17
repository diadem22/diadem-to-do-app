FROM node:18-alpine

ENV MONGO_DB_USERNAME=Ifeoluwa \
    MONGO_DB_PWD=password

RUN mkdir -p /To-do-App/app

COPY ./app /To-do-App/app


WORKDIR /To-do-App/app

RUN npm install

CMD ["node", "app.js"]

