# Dockerfile.backend (ở gốc)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY ./backend ./backend
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]
