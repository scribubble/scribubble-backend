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
    position: {
      x: data.mousePos.x,
      y: data.mousePos.y,
      z: data.mousePos.z
    }
  }
}

const initialShapeData = (data) => {
  return {
    name: data.objName,
    shape: data.shape,
    position: {
      x: data.position.x,
      y: data.position.y,
      z: data.position.z
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
      // console.log(`${param} is not in memory`);

      Bubble.find({ bubbleName: param }) // DB에 있던 버블인 경우
        .then((result) => {
          loadedData[param] = result;
          
          if(loadedData[param].visitor_id.includes(socket.id) === false) {
            loadedData[param].visitor_id.push(socket.id);
          }
          
          // console.log(`get loadedData[${param}]: ${loadedData[param]}`);

          socket.emit("get saved bubble", loadedData[param]);
        })
        .catch((err) => { // DB에 없었던 버블인 경우
          const bubble = new Bubble(
            {bubbleName: param, owner_id: socket.id, visitor_id: socket.id}
          );
          
          bubble.save(bubble)
            .then((savedBubble) => {
              // console.log(`new bubble ${param} ${savedBubble}`);

              loadedData[param] = savedBubble;
              socket.emit("get saved bubble", savedBubble);
            })
            .catch((err) => console.log(err));
        });
    } else { // 버블이 메모리에 있는 경우
      // console.log(`${param} is in memory`);

      if(loadedData[param].visitor_id.includes(socket.id) === false) {
        loadedData[param].visitor_id.push(socket.id);
      }

      socket.emit("get saved bubble", loadedData[param]);
    }
  });

  /* Draw */
  socket.on("draw start", (data) => {
    // console.log("draw start");
    // console.log("draw start", data);

    tempLineData[data.user_id] = initialLineData(data);
    // console.log(data.name);
    // console.log(tempLineData[data.user_id]);
    
    io.emit("draw start", data);
  });

  socket.on("drawing", (data) => {
    // console.log("drawing");
    // console.log("drawing", data);

    tempLineData[data.user_id].linePositions.push(data.mousePos);

    io.emit("drawing", data);
  });

  socket.on("draw stop", (data) => {
    // console.log("draw stop");
    loadedData[data.bubbleName].line.push(tempLineData[data.user_id]);
    Bubble.updateOne({"bubbleName": data.bubbleName}, 
      {"line": loadedData[data.bubbleName].line})
      .then((savedBubble) => {
        // console.log(`${data.bubbleName} is saved`);
        delete tempLineData[data.user_id];
        io.emit("draw stop", data);
      })
      .catch((err) => {
        console.log(err);
      });
  })

  socket.on("move obj", (data) => {
    // console.log("move obj");
    let index = loadedData[data.bubbleName].line.findIndex((obj) => obj.name === data.objName);

    if(index >= 0) {
      loadedData[data.bubbleName].line.map((obj) => {
        if(obj.name === data.objName) {
          obj.position.x = data.position.x;
          obj.position.y = data.position.y;
          obj.position.z = data.position.z;
          // console.log(`obj line ${obj.name === data.objName}`);
        }
      });

      Bubble.updateOne({$and: [{"bubbleName": data.bubbleName}, {"line.$.name": data.objName}]}, 
        {"line": loadedData[data.bubbleName].line})
      .then((savedBubble) => {
        // console.log(`${data.bubbleName} is saved`);
        io.emit("move obj", data);
      })
      .catch((err) => {
        console.log(err);
      });

    } else {
      index = loadedData[data.bubbleName].shape.findIndex((obj) => obj.name === data.objName);
      loadedData[data.bubbleName].shape.map((obj) => {
        if(obj.name === data.objName) {
          obj.position.x = data.position.x;
          obj.position.y = data.position.y;
          obj.position.z = data.position.z;
          // console.log(`obj shape ${obj.name === data.objName}`);
        }
      });
      Bubble.updateOne({$and: [{"bubbleName": data.bubbleName}, {"shape.$.name": data.objName}]},
        {"shape": loadedData[data.bubbleName].shape})
      .then((savedBubble) => {
        // console.log(`${data.bubbleName} is saved`);
        io.emit("move obj", data);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  });

  socket.on("delete obj", (data) => {
    let index = loadedData[data.bubbleName].line.findIndex((obj) => obj.name === data.objName);
    console.log(index);
    if(index >= 0) {
      loadedData[data.bubbleName].line.splice(index, 1);

      Bubble.updateOne({$and: [{"bubbleName": data.bubbleName}, {"line.$.name": data.objName}]}, 
        {"line": loadedData[data.bubbleName].line})
      .then((savedBubble) => {
        // console.log(`${data.bubbleName} is saved`);
        io.emit("delete obj", data);
      })
      .catch((err) => {
        console.log(err);
      });
    } else {
      index = loadedData[data.bubbleName].shape.findIndex((obj) => obj.name === data.objName);
      loadedData[data.bubbleName].shape.splice(index, 1);
      console.log(index);

      Bubble.updateOne({$and: [{"bubbleName": data.bubbleName}, {"shape.$.name": data.objName}]}, 
        {"shape": loadedData[data.bubbleName].shape})
      .then((savedBubble) => {
        // console.log(`${data.bubbleName} is saved`);
        io.emit("delete obj", data);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  });

  socket.on("create shape", (data) => {
    // console.log("create  shape");
    loadedData[data.bubbleName].shape.push(initialShapeData(data));
    Bubble.updateOne({bubbleName: data.bubbleName}, 
      {"shape": loadedData[data.bubbleName].shape})
    .then((savedBubble) => {
      // console.log(`${data.bubbleName} is saved`);
      socket.broadcast.emit("create shape", data);
    })
    .catch((err) => {
      console.log(err);
    });
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