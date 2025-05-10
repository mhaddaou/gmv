FROM node:20

WORKDIR /backend

RUN apt-get update -y

COPY ./*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

EXPOSE 6465

CMD ["npm", "run", "start:prod"]