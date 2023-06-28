FROM node:18.5.0-alpine3.15
WORKDIR /app

# install gcc
RUN apk add --update build-base

# install python3
RUN apk add --update python3

COPY package*.json ./
RUN npm install 
COPY . .

EXPOSE 5000
ENV JWT_TOKEN_SECRET = "asdfasd(ASdfaa)256165156161565&asdf6515615[][][][]()()()()/*9669++-"

CMD ["node", "app.js"];
