FROM node:5.1

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]