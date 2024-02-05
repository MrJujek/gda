FROM node:21

WORKDIR /frontend

COPY yarn.lock package.json tailwind.config.js tsconfig.json ./

RUN yarn

COPY . ./

RUN yarn tailwindcss -i ./src/input.css -o ./src/output.css

RUN tsc