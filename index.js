const express = require('express');
const { load } = require('nodemon/lib/config');
const app = express();

const http = require('http').createServer(app);

const port = process.env.PORT || 4000;

const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    credentials: true
  }
});

const { getSavedData, insertData, updateData, deleteData } = require('./db/dbcon'); // mongodb connection

let loadedData = {};
let tempLine = []; /*
let tempLine = {
  'id_1': {
    linePositions: [],
    lineColor: "",
    lineWidth: 0,
    position: [],
    scale: [],
    rotation: []
  },
  'id_2': {
    ...
  },
  ...
}; */

io.on('connection', (socket) => {
  console.log('CONNECT !!!!!');

  // 접속하면 socketId를 저장하게함 io.to(socket.id)
  socket.emit('user_id', { user_id: socket.id });

  /* DB: mongodb */
  // 저장된 데이터 불러오기
  socket.on('enter bubble', (bubbleName) => {
    console.log('enter bubble');

    if (!loadedData[bubbleName]) {
      getSavedData(bubbleName).then((data) => {
        loadedData[bubbleName] = data;
        console.log(`loadedData[${bubbleName}]: `, loadedData[bubbleName]);
      });
    }

    socket.emit('get saved bubble', loadedData[bubbleName]);
  });


  // 버블 데이터 저장하기
  socket.on('save bubble', (param) => {
    console.log('save bubble');
    console.log('tempLine[param.userid]',tempLine[param.userid] );
    console.log('tempLine',tempLine);

    loadedData["room1"].line.push(tempLine[param.userid]); // 임시

    console.log('loadedData["room1"]', loadedData["room1"]);
    insertData(loadedData["room1"]);
  });


  /* Draw */
  socket.on('draw start', (data) => {
    console.log("draw start", data);

    io.emit('draw start', data);

    console.log(loadedData);
    console.log("data.user_id", data.user_id);

    let bubblename = 'room1'; //임시
    if (loadedData[bubblename] !== null) { 
      loadedData[bubblename].userid.push(data.user_id);
      tempLine[data.user_id] = {
        linePositions: [{
          x: data.mousePos.x,
          y: data.mousePos.y,
          z: data.mousePos.z
        }],
        lineColor: data.color,
        lineWidth: data.linewidth,
        position: ["d"],
        scale: ["d"],
        rotation: ["d"]
      };
    }
  });

  socket.on('drawing', (data) => {
    // console.log(data);

    io.emit('drawing', data);

    tempLine[data.user_id].linePositions.push({
      x: data.mousePos.x,
      y: data.mousePos.y,
      z: data.mousePos.z
    });
  });

  socket.on('draw stop', (data) => {
    console.log("draw stop:", data);
    console.log("draw stop:", tempLine);
    
  });

  socket.on('move line', (data) => {
    moveLine(data.user_id, data.moveX, data.moveY, data.moveZ);
  });

  socket.on('remove current', (data) => {
    removeLastLine(data.user_id, scene);
  });

  /* Disconnecting */
  socket.on('disconnecting', function () {
    console.log("disconnect : ", socket.id);

    try {

    } catch (e) {
      console.log('disconnect', e);
    }
  });

});

http.listen(port, () => {
  console.log(`Connected at ${port}`);
});
