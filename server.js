const express = require("express");
const app = express();

const http = require("http").createServer(app);

const PORT = process.env.PORT || 4000;

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

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

io.on("connection", (socket) => {
  console.log("CONNECT !!!!!");

  // 접속하면 socketId를 저장하게함 io.to(socket.id)
  socket.emit("user_id", { user_id: socket.id });

  /* DB: mongodb */
  // 저장된 데이터 불러오기
  socket.on("enter bubble", (param) => {
    console.log("enter bubble");

    if (!loadedData[param]) {
      Bubble.find({ bubbleName: param })
        .then((result) => {
          loadedData[param] = result;
          console.log(
            `get loadedData[${param}]: ${loadedData[param]}`
          );
          socket.emit("get saved bubble", loadedData[param]);
        })
        .catch((err) => {
          socket.emit("error", err);
        });

      // loadedData[param] = require('./db/draw-data.json'); // 임시
    }
  });

  // 버블 데이터 저장하기
  socket.on("save bubble", (param) => {
    // console.log(`save bubble - ${param.bubbleName} with ${tempLine[param.user_id]}`);

    // loadedData[param.bubbleName].line.push(tempLine[param.user_id]);

    // const bubble = new Bubble(loadedData[param.bubbleName]);

    // Bubble.updateOne({ bubbleName: param.bubbleName }, bubble, {upsert: true})
    //   .then(() => {})
    //   .catch(() => {});
  });

  /* Draw */
  socket.on("draw start", (data) => {
    console.log("draw start", data);

    io.emit("draw start", data);

    console.log(loadedData);
    console.log("data.user_id", data.user_id);

    let bubblename = "room1"; //임시
    if (loadedData[bubblename] !== null) {
      loadedData[bubblename].user_id.push(data.user_id);
      tempLine[data.user_id] = {
        linePositions: [
          {
            x: data.mousePos.x,
            y: data.mousePos.y,
            z: data.mousePos.z,
          },
        ],
        lineColor: data.color,
        lineWidth: data.linewidth,
        position: ["d"],
        scale: ["d"],
        rotation: ["d"],
      };
    }
  });

  socket.on("drawing", (data) => {
    // console.log(data);

    io.emit("drawing", data);

    tempLine[data.user_id].linePositions.push({
      x: data.mousePos.x,
      y: data.mousePos.y,
      z: data.mousePos.z,
    });
  });

  socket.on("draw stop", (data) => {
    console.log("draw stop:", data);
    console.log("draw stop:", tempLine);
  });

  socket.on("move line", (data) => {
    moveLine(data.user_id, data.moveX, data.moveY, data.moveZ);
  });

  socket.on("remove current", (data) => {
    removeLastLine(data.user_id, scene);
  });

  /* Disconnecting */
  socket.on("disconnecting", function () {
    console.log("disconnect : ", socket.id);

    try {
    } catch (e) {
      console.log("disconnect", e);
    }
  });
});
http.listen(PORT, () => {
  console.log(`Connected at ${PORT}`);
});
const mongoose = require("mongoose");
const Bubble = require("./db/bubbleModel.js").Bubble;
const DB_URI = "mongodb://mongo:27017/scribubble";

// mongoose.connect(DB_URI).then(() => {

// });
