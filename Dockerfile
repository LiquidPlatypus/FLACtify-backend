FROM node:24.13-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]