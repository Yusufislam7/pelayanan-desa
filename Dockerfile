FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN mkdir -p /usr/src/app/uploads && \
    apk add --no-cache curl

EXPOSE 5500

ENV NODE_ENV=production

CMD ["node", "server.js"]
