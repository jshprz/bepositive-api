FROM node:16.14.2

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
RUN npm install
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-setuptools \
        groff \
        less \
    && python3 -m pip install --upgrade pip \
    && apt-get clean

RUN python3 -m pip --no-cache-dir install --upgrade awscli
RUN aws configure set aws_access_key_id AKIAY5YQZUVFC7ACDUW6; aws configure set aws_secret_access_key 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; aws configure set default.region ap-southeast-2

COPY . .

EXPOSE ${PORT}

CMD ["npm", "run", "dev"]