FROM node:14.17.3

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
RUN npm install
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install
RUN aws configure set aws_access_key_id AKIAY5YQZUVFC7ACDUW6; aws configure set aws_secret_access_key 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; aws configure set default.region ap-southeast-2

COPY . .

EXPOSE ${PORT}

CMD ["npm", "run", "dev"]