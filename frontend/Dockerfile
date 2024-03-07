FROM node:21

WORKDIR /frontend

COPY yarn.lock package.json tailwind.config.js ./

RUN yarn

COPY . ./

RUN yarn tailwindcss -i ./src/style/input.css -o ./src/style/output.css

RUN yarn build

CMD ["yarn", "dev"]