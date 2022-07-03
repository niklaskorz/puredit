FROM node:16 AS build

WORKDIR /build
COPY . .
RUN npm install
RUN npm -w apps/example run build

FROM nginx:1.23-alpine

COPY --from=build /build/apps/example/dist /usr/share/nginx/html
