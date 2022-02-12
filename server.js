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

let loadedData = [];
let tempLineData = [];

io.on("connection", (socket) => {
  console.log(`CONNECT !!!! ${socket.id}`);

  // 새로운 버블로 이동 (사용자가 버블을 생성하고 이동 할 수 있을 경우 사용)
  // socket.on('join room', (previousRoom, newRoom) => {
  //   socket.leave(previousRoom);
  //   socket.join(newRoom);
  //   socket.emit('room changed', newRoom);
  // });

  // 접속하면 socketId를 저장하게함 io.to(socket.id)
  socket.emit("user_id", { user_id: socket.id });

  // 저장된 데이터 불러오기
  socket.on("enter bubble", (param) => {
    console.log(`enter bubble ${param}`);
    
    socket.join(param);

    if (!loadedData[param]) { // 요청한 버블이 메모리에 없는 경우
      console.log(`${param} is not in memory`);

      const query = { bubbleName: param };

      Bubble.findOne(query)
        .then((result) => { 
          console.log(`콘솔 시작`);
          console.log(`result ${result}`);

          if(result !== null) { // DB에 있던 버블인 경우
            console.log(1); 
            loadedData[param] = result;
          
            if(loadedData[param].visitor_id.includes(socket.id) === false) {
              loadedData[param].visitor_id.push(socket.id);
            }
            
            // console.log(`get loadedData[${param}]: ${loadedData[param]}`);
          } else { // DB에 없었던 버블인 경우
            console.log(2); 
            const newBubble = new Bubble(
              {bubbleName: param, owner_id: socket.id, visitor_id: socket.id}
            );
            console.log(newBubble); 
            loadedData[param] = newBubble;
            
            // newBubble.save(newBubble)
            //   .then((savedBubble) => {
            //     console.log(`new bubble ${param} ${savedBubble}`);
  
            //     loadedData[param] = savedBubble;
            //   })
            //   .catch((err) => console.log(err));
          }
          io.to(socket.id).emit("get saved bubble", loadedData[param]);
        })
        .catch((err) => console.log(err));
    } else {
      console.log(3);
      io.to(socket.id).emit("get saved bubble", loadedData[param]);
    }
  });

  /* Draw */
  socket.on("draw start", (data) => {
    // console.log("draw start");
    // console.log("draw start", data);

    tempLineData[data.user_id] = new Line({
      drawer_id: data.user_id,
      lineWidth: data.linewidth,
      lineColor: data.color,
      lineDashed: data.dashed,
      objName: data.objName,
      linePositions: [
        {
          x: data.mousePos.x,
          y: data.mousePos.y,
          z: data.mousePos.z,
        },
      ],
    });
    // console.log(data.name);
    // console.log(tempLineData[data.user_id]);

    io.emit("draw start", data);
    // socket.emit("draw start", data);
    // socket.to(data.bubbleName).emit("draw start", data);
  });

  socket.on("drawing", (data) => {
    // console.log("drawing");
    // console.log("drawing", data);

    tempLineData[data.user_id].linePositions.push(data.mousePos);

    io.emit("drawing", data);
    // socket.emit("drawing", data);
    // socket.to(data.bubbleName).emit("drawing", data);
  });

  socket.on("draw stop", (data) => {
    console.log("draw stop", data);

    loadedData[data.bubbleName].tfcPosition = data.tfcPosition;
    loadedData[data.bubbleName].position = data.position;

    loadedData[data.bubbleName].lines.push(tempLineData[data.user_id]);
    delete tempLineData[data.user_id];

    io.emit("draw stop", data);
    // io.in(data.bubbleName).emit("draw stop", data); 
    // socket.emit("draw stop", data);
    // socket.to(data.bubbleName).emit("draw stop", data);
  });

  socket.on("create shape", (data) => {
    // console.log("create  shape");

    loadedData[data.bubbleName].shapes.push(
      new Shape({
        shape: data.shape,
        color: data.color,
        objName: data.objName,
        position: {
          x: data.position.x,
          y: data.position.y,
          z: data.position.z,
        },
      })
    );

    socket.to(data.bubbleName).emit("create shape", data);
  });

  socket.on("move obj", (data) => {
    console.log("move obj", data);
    let index = loadedData[data.bubbleName].lines.findIndex(
      (obj) => obj.objName === data.objName
    );
    console.log(index, data.objName);
    if (index >= 0) {
      let before = loadedData[data.bubbleName].lines[0].position.x;
      loadedData[data.bubbleName].lines.map((obj) => {
        if (obj.objName === data.objName) {
          obj.position = data.position;
          console.log(`obj lines ${obj.objName === data.objName}`);
        }
      });
      let after = loadedData[data.bubbleName].lines[0].position.x;
      console.log(`ba ${before === after}`);
    } else {
      index = loadedData[data.bubbleName].shapes.findIndex(
        (obj) => obj.objName === data.objName
      );
      // console.log(index, data.objName);
      loadedData[data.bubbleName].shapes.map((obj) => {
        if (obj.objName === data.objName) {
          obj.position = data.position;
          // console.log(`obj shapes ${obj.objName === data.objName}`);
        }
      });
      // console.log(data.position);
    }
    socket.to(data.bubbleName).emit("move obj", data);
  });

  socket.on("delete obj", (data) => {
    // console.log(typeof loadedData[data.bubbleName]);
    // console.log(typeof loadedData[data.bubbleName].lines);
    // console.log(typeof loadedData[data.bubbleName].lines[0]);
    // console.log( loadedData[data.bubbleName] instanceof Object);
    // console.log( loadedData[data.bubbleName].lines instanceof Array);
    // console.log( loadedData[data.bubbleName].lines[0] instanceof Object);
    let index = loadedData[data.bubbleName].lines.findIndex((obj) => 
      obj.objName == data.objName
    );
    console.log(index);

    if (index >= 0) {
      loadedData[data.bubbleName].lines.splice(index, 1);
    } else {
      index = loadedData[data.bubbleName].shapes.findIndex(
        (obj) => obj.objName == data.objName
      );

      loadedData[data.bubbleName].shapes.splice(index, 1);
      // console.log(index);
    }
    socket.to(data.bubbleName).emit("delete obj", data);
  });

  /* Disconnect */
  socket.on("disconnecting", function () {
    try {
      let roomArray = Array.from(socket.rooms);
      console.log(`${socket.id} is disconnecting from ${roomArray}`);
      // console.log(roomArray);
      for (let i = 1; i < roomArray.length; i++) {
        let clientCount = io.sockets.adapter.rooms.get(roomArray[i]).size;
        // console.log(clientCount);
        if (clientCount === 1 && loadedData[roomArray[i]]) {
          let query = { bubbleName: roomArray[i] };
          Bubble.findOneAndUpdate(
            query,
            loadedData[roomArray[i]],
            { overwrite: true }
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
const { Bubble, Line, Shape } = require("./db/bubbleModel.js");
const DB_URI = "mongodb://mongo:27017/scribubble";

mongoose.connect(DB_URI).then(() => {
  http.listen(PORT, () => {
    console.log(`Connected at ${PORT}`);
  });
});

/* node-schedule */
const schedule = require("node-schedule");

const rule = new schedule.RecurrenceRule();
rule.hour = 0;

const job = schedule.scheduleJob(rule, function () {
  Bubble.deleteMany({}, () => {
    loadedData = [];
    console.log("collection removed");
  });
});
