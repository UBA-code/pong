FROM node:18.18.0

WORKDIR /app/backend

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
