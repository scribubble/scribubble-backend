FROM node:16.13.1-alpine

WORKDIR /home/ubuntu/scribubble

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
 