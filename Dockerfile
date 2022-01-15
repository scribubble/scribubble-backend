FROM node

# 어플리케이션이 컨테이너 내부에 존재할 위치
WORKDIR /usr/src/app 

# /usr/src/app/package.json이 복사될 것
COPY package.json . 

RUN npm install

COPY . .

EXPOSE 4000

CMD "node" "server.js"
 