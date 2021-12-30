const express = require('express');
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

io.on('connection', (socket) => {
  console.log('CONNECT !!!!!');

  // 접속하면 socketId를 저장하게함 io.to(socket.id)
  socket.emit('user_id', { user_id: socket.id });

  /* mongodb */
  // 이전에 저장된 데이터 불러오기
  socket.on('enter bubble', (bubbleName) => {
    console.log('enter bubble');
    getSavedData(bubbleName).then((data) =>
      socket.emit('get saved bubble', data));
  });

  // 버블 데이터 저장하기
  socket.on('save bubble', (data) => {
    console.log('save bubble');
    // const dataExample = require('./db/draw-data.json');
    insertData(data);
  });

  //================================
  // Draw
  socket.on('draw start', (data) => {
    console.log(data);
    io.emit('draw start', data);
  });

  socket.on('drawing', (data) => {
    console.log(data);
    io.emit('drawing', data);
  });

  socket.on('move line', (data) => {
    moveLine(data.user_id, data.moveX, data.moveY, data.moveZ);
  });

  socket.on('remove current', (data) => {
    removeLastLine(data.user_id, scene);
  });

  //================================
  // Disconnecting
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
