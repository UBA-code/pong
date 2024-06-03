FROM node:18

WORKDIR /var/www/

RUN apt-get update

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]