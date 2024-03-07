FROM node:21

WORKDIR /frontend

COPY yarn.lock package.json tailwind.config.js ./

RUN yarn

COPY . ./

CMD ["yarn", "dev"]