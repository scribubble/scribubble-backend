const app = require('express')();
const httpServer = require("http").createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost";
const CLIENT_PORT = process.env.CLIENT_PORT || 8888;

const io = require("socket.io")(httpServer, {
  cors: {
    origin: `${CLIENT_URL}:${CLIENT_PORT}`,
    credentials: true,
  },
});

const { handleEnter } = require("./handlers/enterHandler")(io);
const {
  handleDrawStart,
  handleDrawing,
  handleDrawStop,
  handleCreateShape,
  handleMvObj,
  handleRtObj,
  handleScObj,
  handleColorObj,
  handleDeleteObj,
} = require("./handlers/scribbleHandler")(io);
const { handleDisconnect } = require("./handlers/connectionHandler")(io);

let loadedData = [];
global.loadedData = loadedData; // global.전역변수명 = 변수명; -> 전역변수로 설정

const { nickNameService } = require("./services/nameService");

console.log("version 9");

const onConnection = (socket) => {
  // ========================================
  console.log(`CONNECT !!!! ${socket.id}`);

  // 새로운 버블로 이동 (사용자가 버블을 생성하고 이동 할 수 있을 경우 사용)
  // socket.on('join room', (previousRoom, newRoom) => {
  //   socket.leave(previousRoom);
  //   socket.join(newRoom);
  //   socket.emit('room changed', newRoom);
  // });

  // 접속하면 socketId를 저장하게함
  // 랜덤 유저 이름 제작
  socket.user_nickname = nickNameService.createNickname();

  socket.emit("user_id", {
    user_id: socket.id,
    user_nickname: socket.user_nickname,
  });

  // 내가 접속함을 알림
  io.emit("user enter", {
    user_id: socket.id,
    user_nickname: socket.user_nickname,
  });

  // ========================================

  socket.on("enter bubble", handleEnter);

  socket.on("draw start", handleDrawStart);
  socket.on("drawing", handleDrawing);
  socket.on("draw stop", handleDrawStop);

  socket.on("create shape", handleCreateShape);

  socket.on("move obj", handleMvObj);
  socket.on("rotate obj", handleRtObj);
  socket.on("scale obj", handleScObj);
  socket.on("change obj color", handleColorObj);

  socket.on("delete obj", handleDeleteObj);

  // ========================================

  socket.on("disconnecting", handleDisconnect);
};

io.on("connection", onConnection);

module.exports = { httpServer };
