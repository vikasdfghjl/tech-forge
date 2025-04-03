FROM node:22-alpine3.20

WORKDIR /app

COPY package.json .

RUN npm install 

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]