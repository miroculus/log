FROM node:12.18.2-alpine

ARG NPM_TOKEN

WORKDIR /src

COPY package*.json ./

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /.npmrc
RUN npm ci
RUN rm -f /.npmrc

COPY . /src/
