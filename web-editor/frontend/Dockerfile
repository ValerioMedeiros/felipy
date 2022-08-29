FROM node

WORKDIR /app
COPY . .

RUN npm i -g pnpm
RUN pnpm i

CMD [ "pnpm", "run", "dev" ]
EXPOSE 5173
