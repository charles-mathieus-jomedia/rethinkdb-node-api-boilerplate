FROM node:alpine

RUN npm install pm2 -g

CMD pm2-docker index.js