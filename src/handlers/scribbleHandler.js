function findObjByObjName(bubbleName, objName) {
  return new Promise((resolve, reject) => {
    if (loadedData[bubbleName]) {
      let result = { objType: "", index: -1 };

      let idx = loadedData[bubbleName].lines.findIndex(
        (obj) => obj.objName === objName
      );

      if (idx >= 0) {
        result.objType = "lines";
        result.index = idx;
      } else {
        idx = loadedData[bubbleName].shapes.findIndex(
          (obj) => obj.objName === objName
        );
        result.objType = "shapes";
        result.index = idx;
      }
      resolve(result);
    } else {
      reject(console.log(`${bubbleName} does not in memory.`));
    }
  });
}

module.exports = (io) => {
  const handleDrawStart = function (payload) {
    try {
      console.log(loadedData);
      loadedData[payload.bubbleName].lines.push({
        drawer_id: payload.user_id,
        linePositions: [
          {
            x: payload.mousePos.x,
            y: payload.mousePos.y,
            z: payload.mousePos.z,
          },
        ],
        lineColor: payload.color,
        lineWidth: payload.linewidth,
        lineDashed: payload.dashed,
        objName: payload.objName,
        position: { x: 0, y: 0, z: 0 },
        tfcPosition: { x: 0, y: 0, z: 0 },
        tfcScale: { x: 1, y: 1, z: 1 },
        tfcRotation: { x: 0, y: 0, z: 0 },
      });

      io.to(payload.bubbleName).emit("draw start", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDrawing = async function (payload) {
    try {
      let result = await findObjByObjName(payload.bubbleName, payload.objName);

      loadedData[payload.bubbleName][result.objType][
        result.index
      ].linePositions.push({
        x: payload.mousePos.x,
        y: payload.mousePos.y,
        z: payload.mousePos.z,
      });

      io.to(payload.bubbleName).emit("drawing", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDrawStop = async function (payload) {
    try {
      let result = await findObjByObjName(payload.bubbleName, payload.objName);

      if (result.objType === "lines") {
        loadedData[payload.bubbleName][result.objType][
          result.index
        ].tfcPosition = payload.tfcPosition;
        loadedData[payload.bubbleName][result.objType][result.index].position =
          payload.position;
      }

      io.to(payload.bubbleName).emit("draw stop", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateShape = function (payload) {
    try {
      const socket = this;
      loadedData[payload.bubbleName].shapes.push({
        shape: payload.shape,
        color: payload.color,
        objName: payload.objName,
        position: {
          x: payload.position.x,
          y: payload.position.y,
          z: payload.position.z,
        },
        rotation: {
          x: payload.rotation.x,
          y: payload.rotation.y,
          z: payload.rotation.z,
        },
        scale: { x: payload.scale.x, y: payload.scale.y, z: payload.scale.z },
      });

      socket.to(payload.bubbleName).emit("create shape", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMvObj = async function (payload) {
    try {
      const socket = this;
      let result = await findObjByObjName(payload.bubbleName, payload.objName);

      if (result.objType === "lines" && payload.tfcPosition) {
        loadedData[payload.bubbleName][result.objType][
          result.index
        ].tfcPosition = payload.tfcPosition;
      } else if (result.objType === "shapes" && payload.position) {
        loadedData[payload.bubbleName][result.objType][result.index].position =
          payload.position;
      }

      socket.broadcast.emit("move obj", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRtObj = async function (payload) {
    try {
      const socket = this;
      const result = await findObjByObjName(
        payload.bubbleName,
        payload.objName
      );

      if (result.objType === "lines") {
        loadedData[payload.bubbleName][result.objType][
          result.index
        ].tfcRotation = payload.rotation;
      } else if (result.objType === "shapes") {
        loadedData[payload.bubbleName][result.objType][result.index].rotation =
          payload.rotation;
      }

      socket.to(payload.bubbleName).emit("rotate obj", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleScObj = async function (payload) {
    try {
      const socket = this;
      const result = await findObjByObjName(
        payload.bubbleName,
        payload.objName
      );

      if (result.objType === "lines") {
        loadedData[payload.bubbleName][result.objType][result.index].tfcScale =
          payload.scale;
      } else if (result.objType === "shapes") {
        loadedData[payload.bubbleName][result.objType][result.index].scale =
          payload.scale;
      }

      socket.to(payload.bubbleName).emit("scale obj", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleColorObj = async function (payload) {
    try {
      const socket = this;
      const result = await findObjByObjName(
        payload.bubbleName,
        payload.objName
      );

      if (result.objType === "lines") {
        loadedData[payload.bubbleName][result.objType][result.index].lineColor =
          payload.color;
      } else if (result.objType === "shapes") {
        loadedData[payload.bubbleName][result.objType][result.index].color =
          payload.color;
      }

      socket.to(payload.bubbleName).emit("change obj color", payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteObj = async function (payload) {
    try {
      const socket = this;
      const result = await findObjByObjName(
        payload.bubbleName,
        payload.objName
      );

      loadedData[payload.bubbleName][result.objType].splice(result.index, 1);

      socket.to(payload.bubbleName).emit("delete obj", payload);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    handleDrawStart,
    handleDrawing,
    handleDrawStop,
    handleCreateShape,
    handleMvObj,
    handleRtObj,
    handleScObj,
    handleColorObj,
    handleDeleteObj,
  };
};
