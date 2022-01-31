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

const initialLineData = (data) => {
  return {
    drawer_id: data.user_id,
    linePositions: [{
      x: data.mousePos.x,
      y: data.mousePos.y,
      z: data.mousePos.z
    }],
    lineColor: data.color,
    lineWidth: data.linewidth,
    position: [],
    scale: [],
    rotation: [],
    lineDash: []
  }
}

let loadedData = [];
let tempLineData = [];

io.on("connection", (socket) => {
  console.log("CONNECT !!!!!");

  // 접속하면 socketId를 저장하게함 io.to(socket.id)
  socket.emit("user_id", { user_id: socket.id });

  // 저장된 데이터 불러오기
  socket.on("enter bubble", (param) => {
    console.log("enter bubble");

    if (!loadedData[param]) { // 버블이 메모리에 없는 경우
      console.log(`${param} is not in memory`);

      Bubble.find({ bubbleName: param }) // DB에 있던 버블인 경우
        .then((result) => {
          loadedData[param] = result;
          
          if(loadedData[param].visitor_id.includes(socket.id) === false) {
            loadedData[param].visitor_id.push(socket.id);
          }
          
          console.log(`get loadedData[${param}]: ${loadedData[param]}`);

          socket.emit("get saved bubble", loadedData[param]);
        })
        .catch((err) => { // DB에 없었던 버블인 경우
          const bubble = new Bubble({bubbleName: param, owner_id: socket.id, visitor_id: socket.id});
          
          bubble.save(bubble)
            .then((savedBubble) => {
              console.log(`new bubble ${param} ${savedBubble}`);

              loadedData[param] = savedBubble;
              socket.emit("get saved bubble", savedBubble);
            })
            .catch((err) => console.log(err));
        });
    } else { // 버블이 메모리에 있는 경우
      console.log(`${param} is in memory`);

      if(loadedData[param].visitor_id.includes(socket.id) === false) {
        loadedData[param].visitor_id.push(socket.id);
      }
      
      socket.emit("get saved bubble", loadedData[param]);
    }
  });

  /* Draw */
  socket.on("draw start", (data) => {
    console.log("draw start");
    // console.log("draw start", data);

    tempLineData[data.user_id] = initialLineData(data);
    // console.log(tempLineData[data.user_id]);
    
    io.emit("draw start", data);
  });

  socket.on("drawing", (data) => {
    console.log("drawing");
    // console.log("drawing", data);

    tempLineData[data.user_id].linePositions.push(data.mousePos);

    io.emit("drawing", data);
  });

  socket.on("draw stop", (data) => {
    console.log("draw stop");
    
    Bubble.findOneAndUpdate(loadedData[data.bubbleName].line.push(tempLineData[data.user_id]))
      .then((savedBubble) => {
        console.log(`${data.bubbleName} is saved`);
        delete tempLineData[data.user_id];
      })
      .catch((err) => {
        console.log(err);
      });
  })

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

const mongoose = require("mongoose");
const Bubble = require("./db/bubbleModel.js").Bubble;
const DB_URI = "mongodb://mongo:27017/scribubble";

mongoose.connect(DB_URI).then(() => {
  http.listen(PORT, () => {
    console.log(`Connected at ${PORT}`);
  });
});
