FROM node:19.5.0-alpine3.16 AS builder
WORKDIR /app
RUN apk update
COPY . .
RUN yarn install && \
    yarn build


FROM node:19.5.0-alpine3.16
WORKDIR /app
ENV HOST=0.0.0.0
ADD package.json ./
ADD nuxt.config.js ./
COPY --from=builder ./app/node_modules ./node_modules/
COPY --from=builder ./app/.nuxt ./.nuxt/
COPY --from=builder ./app/static ./static/
EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
