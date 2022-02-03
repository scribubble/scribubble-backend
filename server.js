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
    lineDashed: data.dashed,
    name: data.name,
    position: [],
    scale: [],
    rotation: [],
  }
}

const initialShapeData = (data) => {
  return {
    shape: data.shape,
    position: {
      x: 0,
      y: 0,
      z: 0
    }
  }
}

let loadedData = [];
let tempLineData = [];

io.on("connection", (socket) => {
  console.log(`CONNECT !!!!! ${socket.id}`);

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
    console.log(data.name);
    console.log(tempLineData[data.user_id]);
    
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
    
    Bubble.findOneAndUpdate({bubbleName: data.bubbleName}, loadedData[data.bubbleName].line.push(tempLineData[data.user_id]))
      .then((savedBubble) => {
        console.log(`${data.bubbleName} is saved`);
        delete tempLineData[data.user_id];
      })
      .catch((err) => {
        console.log(err);
      });

    io.emit("draw stop", data);
  })

  socket.on("move obj", (data) => {
    console.log(data);
    io.emit("move obj", data);
  });

  socket.on("remove line", (data) => {
    let index = loadedData[data.bubbleName].line.findIndex((obj) => obj.name == data.name);
    Bubble.findOneAndUpdate({bubbleName: data.bubbleName}, loadedData[data.bubbleName].line.splice(index, 1))
    .then((savedBubble) => {
      console.log(`${data.bubbleName} is saved`);
      io.emit("remove line", data);
    })
    .catch((err) => {
      console.log(err);
    });
  });

  socket.on("create shape", (data) => {
    
    // Bubble.findOneAndUpdate({bubbleName: data.bubbleName}, loadedData[data.bubbleName].shape.push(initialShapeData(data)))
    // .then((savedBubble) => {
    //   console.log(`${data.bubbleName} is saved`);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });

    io.emit("create shape", data);
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

/* mongoose */
const mongoose = require("mongoose");
const Bubble = require("./db/bubbleModel.js").Bubble;
const DB_URI = "mongodb://mongo:27017/scribubble";

mongoose.connect(DB_URI).then(() => {
  http.listen(PORT, () => {
    console.log(`Connected at ${PORT}`);
  });
});

/* node-schedule */
const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
rule.hour = 0;

const job = schedule.scheduleJob(rule, function(){
  Bubble.deleteMany({}, () => {
    loadedData = [];
    console.log('collection removed');
  });
});