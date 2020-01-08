FROM node:erbium

WORKDIR /app

COPY . .
RUN npm install

CMD node app.js

EXPOSE 3000