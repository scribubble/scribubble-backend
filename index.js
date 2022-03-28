const app = require('express')();
const httpServer = require("http").createServer(app);
const SERVER_PORT = process.env.SERVER_PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost";
const CLIENT_PORT = process.env.CLIENT_PORT || 8888;

const io = require("socket.io")(httpServer, {
  cors: {
    origin: `${CLIENT_URL}:${CLIENT_PORT}`,
    credentials: true,
  },
});

const { handleEnter } = require("./src/handlers/enterHandler")(io);
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
} = require("./src/handlers/scribbleHandler")(io);
const { handleDisconnect } = require("./src/handlers/connectionHandler")(io);

let loadedData = [];
global.loadedData = loadedData; // global.전역변수명 = 변수명; -> 전역변수로 설정

const { adjective, animal } = require("./src/services/nameService");

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}
let nameIdx = 0;

console.log("version 9");

const onConnection = (socket) => {
  // =======여기를 어떻게 정리좀 하고 싶다============
  console.log(`CONNECT !!!! ${socket.id}`);
  // 새로운 버블로 이동 (사용자가 버블을 생성하고 이동 할 수 있을 경우 사용)
  // socket.on('join room', (previousRoom, newRoom) => {
  //   socket.leave(previousRoom);
  //   socket.join(newRoom);
  //   socket.emit('room changed', newRoom);
  // });

  // 접속하면 socketId를 저장하게함
  // 랜덤 유저 이름 제작
  socket.user_nickname =
    adjective[nameIdx % adjective.length] +
    " " +
    animal[nameIdx % animal.length];
  socket.emit("user_id", {
    user_id: socket.id,
    user_nickname: socket.user_nickname,
  });
  nameIdx++;
  if (nameIdx >= adjective.length * animal.length) {
    nameIdx = 0;
    shuffle(adjective);
    shuffle(animal);
  }

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

  socket.on("disconnecting", handleDisconnect);
};

io.on("connection", onConnection);

/* mongoose */
const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/scribubble";
mongoose.connect(DB_URL).then(() => {
  httpServer.listen(SERVER_PORT, () => {
    console.log(`Server is listening on ${SERVER_PORT}`);
  });
});

/* node-schedule */
const schedule = require("node-schedule");

const rule = new schedule.RecurrenceRule();
rule.hour = 0;

schedule.scheduleJob(rule, function () {
  Bubble.deleteMany({}, () => {
    loadedData = [];
    console.log("All data in DB has removed");
  });
});

