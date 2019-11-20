FROM node:12.13.0
ARG NPM_TOKEN

RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libglu1

WORKDIR /src

COPY package*.json ./

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /.npmrc
RUN npm audit
RUN npm ci
RUN rm -f /.npmrc

COPY . /src/
