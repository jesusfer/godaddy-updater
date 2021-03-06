FROM node:10-alpine as build

WORKDIR /app

COPY package*.json ./
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json

RUN npm install && npm run build

FROM node:10-alpine

WORKDIR /app

COPY --from=build /app/package*.json /app/

RUN set -ex \
    && apk --update add --no-cache wget \
    && npm install --production;

COPY --from=build /app/dist /app/dist

CMD ["npm", "run", "start:dist"]
