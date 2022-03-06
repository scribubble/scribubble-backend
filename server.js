const express = require("express");
const http = require('http');
const path = require("path");
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();

const opts = {
  requestCert: false,
  rejectUnauthorized: false
}

const server = http.createServer(opts, app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let loadedData = [];

const { adjective, animal } = require('./data/name');

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i --) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}
let nameIdx = 0;

function findObjByObjName(bubbleName, objName) {
  return new Promise((resolve, reject) => {
    if(loadedData[bubbleName]) {
      let result = { objType: "", index : -1};
    
      let idx = loadedData[bubbleName].lines.findIndex(
        (obj) => obj.objName === objName
      );
  
      if(idx >= 0) {
        result.objType = 'lines';
        result.index = idx;
      } else {
        idx = loadedData[bubbleName].shapes.findIndex(
          (obj) => obj.objName === objName
        );
        result.objType = 'shapes';
        result.index = idx;
      }
      resolve(result);
    } else {
      reject(console.log(`${bubbleName} does not in memory.`));
    }
  })
}

function loadBubbleData(socket, param) {
  if (loadedData[param]) { // 요청한 버블이 메모리에 있는 경우
    console.log(`${param} is in memory`);

    io.to(socket.id).emit("get saved bubble", loadedData[param]);
    return;
  } else { // 요청한 버블이 메모리에 없는 경우
    console.log(`${param} is not in memory`);

    const query = { bubbleName: param };

    Bubble
    .findOne(query).lean()
    .then((result) => { 
      if(result) { // DB에 있던 버블인 경우
        console.log(`${param} is in DB`);

        loadedData[param] = result;

        if(loadedData[param].visitor_id.includes(socket.id) === false) {
          loadedData[param].visitor_id.push(socket.id);
        }

        // console.log(`loadedData[${param}] ${loadedData[param]}`); 
      } else { // 버블을 새로 만드는 경우
        console.log(`${param} is not in DB`);
        
        const defaultBubble = require('./data/defaultBubble.json');
        // console.log(defaultBubble.lines);
        const newBubble = new Bubble(
          {bubbleName: defaultBubble.bubbleName, owner_id: defaultBubble.owner_id, visitor_id: socket.id, lines: defaultBubble.lines}
        );
        loadedData[param] = newBubble;

        // console.log(`newBubble ${newBubble}`); 
        // console.log(`loadedData[${param}] ${loadedData[param]}`); 
      }
      io.to(socket.id).emit("get saved bubble", loadedData[param]);
    })
    .catch((err) => console.log(err));
  }
}

console.log('version 8');

io
.on("connection", (socket) => {
  console.log(`CONNECT !!!! ${socket.id}`);

  // 새로운 버블로 이동 (사용자가 버블을 생성하고 이동 할 수 있을 경우 사용)
  // socket.on('join room', (previousRoom, newRoom) => {
  //   socket.leave(previousRoom);
  //   socket.join(newRoom);
  //   socket.emit('room changed', newRoom);
  // });

  // 접속하면 socketId를 저장하게함
  // 랜덤 유저 이름 제작
  socket.user_nickname = adjective[nameIdx % adjective.length] + ' ' + animal[nameIdx % animal.length];
  socket.emit("user_id", { user_id: socket.id, user_nickname: socket.user_nickname });
  nameIdx++;
  if (nameIdx >= adjective.length * animal.length)
  {
    nameIdx = 0;
    shuffle(adjective);
    shuffle(animal);
  }

  // 내가 접속함을 알림
  io.emit("user enter", { user_id: socket.id, user_nickname: socket.user_nickname });

  // 저장된 데이터 불러오기
  socket.on("enter bubble", (param) => {

    // 방에 접속하고 있는 인원들에 대한 목록을 보내줌
    const uList = io.sockets.adapter.rooms.get(param);
    if (uList)
    {
      socket.emit("user list", {
        userList: Array.from(uList).map((sID) => {
          const so = io.sockets.sockets.get(sID);
          return {
            user_id: sID,
            user_nickname: so.user_nickname
          };
        })
      });
    }

    // 방에 접속
    socket.join(param);

    loadBubbleData(socket, param);
  });

  /* Draw */
  socket.on("draw start", (data) => {
    loadedData[data.bubbleName].lines.push({
      drawer_id: data.user_id,
      linePositions: [{ x: data.mousePos.x, y: data.mousePos.y, z: data.mousePos.z}],
      lineColor: data.color,
      lineWidth: data.linewidth,
      lineDashed: data.dashed,
      objName: data.objName,
      position: { x: 0, y: 0, z: 0,},
      tfcPosition: { x: 0, y: 0, z: 0,},
      tfcScale: { x: 1, y: 1, z: 1,},
      tfcRotation: { x: 0, y: 0, z: 0,}
    });

    io.to(data.bubbleName).emit("draw start", data);
  });

  socket.on("drawing", async (data) => {
    let result = await findObjByObjName(data.bubbleName, data.objName);

    loadedData[data.bubbleName][result.objType][result.index].linePositions.push({
      x: data.mousePos.x,
      y: data.mousePos.y,
      z: data.mousePos.z,
    });

    io.to(data.bubbleName).emit("drawing", data);
  });

  socket.on("draw stop", async (data) => {
    let result = await findObjByObjName(data.bubbleName, data.objName);

    if(result.objType === 'lines') {
      loadedData[data.bubbleName][result.objType][result.index].tfcPosition = data.tfcPosition;
      loadedData[data.bubbleName][result.objType][result.index].position = data.position;
    }
    
    io.to(data.bubbleName).emit("draw stop", data);
  });

  socket.on("create shape", (data) => {

    loadedData[data.bubbleName].shapes.push({
      shape: data.shape,
      color: data.color,
      objName: data.objName,
      position: { x: data.position.x, y: data.position.y, z: data.position.z },
      rotation: { x: data.rotation.x, y: data.rotation.y, z: data.rotation.z },
      scale: { x: data.scale.x, y: data.scale.y, z: data.scale.z },
    });

    socket.to(data.bubbleName).emit("create shape", data);
  });

  socket.on("move obj", async (data) => {
    let result = await findObjByObjName(data.bubbleName, data.objName);

    if(result.objType === 'lines' && data.tfcPosition) {
      loadedData[data.bubbleName][result.objType][result.index].tfcPosition = data.tfcPosition;
    } else if(result.objType === 'shapes' && data.position){
      loadedData[data.bubbleName][result.objType][result.index].position = data.position;
    }
    
    socket.to(data.bubbleName).emit("move obj", data);
  });

  socket.on("rotate obj", async (data) => {
    const result = await findObjByObjName(data.bubbleName, data.objName);
    
    if(result.objType === 'lines') {
      loadedData[data.bubbleName][result.objType][result.index].tfcRotation = data.rotation;
    } else if(result.objType === 'shapes'){
      loadedData[data.bubbleName][result.objType][result.index].rotation = data.rotation;
    }

    socket.to(data.bubbleName).emit("rotate obj", data);
  });

  socket.on("scale obj", async (data) => {
    const result = await findObjByObjName(data.bubbleName, data.objName);
    
    if(result.objType === 'lines') {
      loadedData[data.bubbleName][result.objType][result.index].tfcScale = data.scale;
    } else if(result.objType === 'shapes'){
      loadedData[data.bubbleName][result.objType][result.index].scale = data.scale;
    }

    socket.to(data.bubbleName).emit("scale obj", data);
  });


  socket.on("change obj color", async(data) => {
    const result = await findObjByObjName(data.bubbleName, data.objName);
    
    if(result.objType === 'lines') {
      loadedData[data.bubbleName][result.objType][result.index].lineColor = data.color;
    } else if(result.objType === 'shapes'){
      loadedData[data.bubbleName][result.objType][result.index].color = data.color;
    }

    socket.to(data.bubbleName).emit("change obj color", data);
  });

  socket.on("delete obj", async (data) => {
    const result = await findObjByObjName(data.bubbleName, data.objName);
    
    loadedData[data.bubbleName][result.objType].splice(result.index, 1);

    socket.to(data.bubbleName).emit("delete obj", data);
  });

  /* Disconnect */
  socket.on("disconnecting", function () {
    try {
      io.emit("user exit", { user_id: socket.id, user_nickname: socket.user_nickname });

      let roomArray = Array.from(socket.rooms);
      console.log(`${socket.id} is disconnecting from ${roomArray}`);
      
      for (let i = 1; i < roomArray.length; i++) {
        let clientCount = io.sockets.adapter.rooms.get(roomArray[i]).size;
        
        if (clientCount === 1 && loadedData[roomArray[i]]) {
          let query = { bubbleName: roomArray[i] };
          Bubble
          .findOneAndUpdate(
            query,
            loadedData[roomArray[i]],
            { new: true, upsert: true,}
          )
          .then((savedBubble) => {
            console.log(`${roomArray[i]} is saved`);
          })
          .catch((err) => {
            console.log(err);
          });
        }
      }
    } catch (e) {
      console.log("disconnect", e);
    }
  });
});

/* mongoose */
const mongoose = require("mongoose");
const { Bubble, Line, Shape, Vector } = require("./db/models");

const DB_URL = process.env.CONNECTIONSTRING || 'mongodb://localhost:27017';

mongoose.connect(DB_URL).then(() => {
  server.listen(PORT, () => {
    console.log(`Connected at ${PORT}`);
  });
});

/* node-schedule */
const schedule = require("node-schedule");

const job = schedule.scheduleJob('00 00 00 * * 0-6', function () {
  Bubble.deleteMany({}, () => {
    loadedData = [];
    console.log("All data has removed");
  });
});
