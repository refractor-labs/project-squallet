FROM node:18-alpine as base
RUN apk update
RUN apk add openjdk8
RUN apk add openssh
RUN apk add git

## install deps this layer so that it is cached by docker for faster docker builds
WORKDIR /usr/src/app
COPY . ./
RUN yarn

#FROM base as prod-build
#
#RUN npm install --production
#RUN cp -R node_modules prod_node_modules
# RUN npx prisma generate

RUN yarn build

RUN export NODE_ENV=production
CMD [ "node", "./packages/api/build/src/server.js" ]

