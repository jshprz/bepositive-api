FROM node:14.17.3

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
RUN npm install

COPY . .

EXPOSE ${PORT}

CMD ["npm", "run", "dev"]