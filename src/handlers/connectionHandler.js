const { Bubble } = require("../db");

module.exports = (io) => {
  const handleDisconnect = async function (payload) {
    try {
      const socket = this;
      io.emit("user exit", {
        user_id: socket.id,
        user_nickname: socket.user_nickname,
      });

      let roomArr = Array.from(socket.rooms);
      console.log(`${socket.id} is disconnecting from ${roomArr}`);

      for (let i = 1; i < roomArr.length; i++) {
        let clientCount = io.sockets.adapter.rooms.get(roomArr[i]).size;

        if (clientCount === 1 && loadedData[roomArr[i]]) {
          await Bubble.saveOne(roomArr[i], loadedData[roomArr[i]])
            .then(console.log(`${roomArr[i]} is saved`))
            .catch((err) => {
              console.log(err);
            });
        }
      }
    } catch (e) {
      console.log("disconnect", e);
    }
  };

  return {
    handleDisconnect,
  };
};
