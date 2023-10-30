# Frontend Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
COPY package*.json ./app

RUN npm install -g serve

COPY . .

CMD ["serve", "-s", "build"]
