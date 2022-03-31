const { Bubble } = require("../db");
const defaultBubble = require("../public/data/defaultBubble.json");

module.exports = (io) => {
  const handleEnter = async function (bubblename) {
    try {
      const socket = this;

      // 방에 접속
      socket.join(bubblename);

      // 방에 접속하고 있는 인원들에 대한 목록을 보내줌
      const uList = io.sockets.adapter.rooms.get(bubblename);
      if (uList) {
        io.to(bubblename).emit("user list", {
          userList: Array.from(uList).map((sID) => {
            const so = io.sockets.sockets.get(sID);
            return {
              user_id: sID,
              user_nickname: so.user_nickname,
            };
          }),
        });
      }

      /* 버블 데이터 전송 */
      if (loadedData[bubblename]) {
        // 1. 요청한 버블이 메모리에 있는 경우
        console.log(`${bubblename} is in memory`)
      } else {
        // 2. 요청한 버블이 메모리에 없는 경우
        console.log(`${bubblename} is not in memory`);

        // 버블 찾기
        const foundBubble = await Bubble.findOneByName(bubblename);

        if (!foundBubble) {
          // 2-1. DB에 버블이 없는 경우
          console.log(`${bubblename} is not in DB.`);

          // 새 버블 생성
          const newBubble = await Bubble.createOne({
            bubbleName: defaultBubble.bubbleName,
            owner_id: defaultBubble.owner_id, // scribubble 소유
            visitor_id: socket.id, // 첫 방문자 기록
            lines: defaultBubble.lines,
          });

          // 메모리에 저장
          loadedData[bubblename] = newBubble;

          console.log(`newBubble ${newBubble}`);
        } else {
          // 2-2. DB에 버블이 있는 경우
          console.log(`${bubblename} is in DB.`);

          // 찾은 버블을 메모리에 저장
          loadedData[bubblename] = foundBubble;

          // 버블에 방문자 기록
          if (loadedData[bubblename].visitor_id.includes(socket.id) === false) {
            loadedData[bubblename].visitor_id.push(socket.id);
          }
        }
      }
      io.to(socket.id).emit("get saved bubble", loadedData[bubblename]);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    handleEnter,
  };
};
