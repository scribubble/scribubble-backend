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

const { nickNameService } = require("./services/nickNameService");
const { resetService } = require("./services/resetService");

let loadedData = [];
global.loadedData = loadedData; // global.전역변수명 = 변수명; -> 전역변수로 설정

console.log("version 9");

const onConnection = (socket) => {
  // ========================================
  console.log(`CONNECT !!!! ${socket.id}`);

  /*  Move to a new bubble (use when the user can create and move a bubble)  */
  // socket.on('join room', (previousRoom, newRoom) => {
  //   socket.leave(previousRoom);
  //   socket.join(newRoom);
  //   socket.emit('room changed', newRoom);
  // });

  // Create random user name
  socket.user_nickname = nickNameService.createNickname();

  socket.emit("user_id", {
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

/* node-schedule */
const schedule = require("node-schedule");
const job = schedule.scheduleJob("00 00 00 * * 0-6", resetService.reset);

module.exports = { httpServer };
