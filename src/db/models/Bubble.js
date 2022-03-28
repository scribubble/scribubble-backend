const { BubbleModel } = require("../schemas/bubble");

class Bubble {
  static findOneByName(bubblename) {
    return BubbleModel.findOne({ bubbleName: bubblename }).lean(); // lean: 도큐먼트를 객체로 변환
  }

  static createOne({ bubbleName, owner_id, visitor_id, lines }) {
    return BubbleModel.create({ bubbleName, owner_id, visitor_id, lines });
  }

  static saveOne(bubblename, toUpdate) {
    return BubbleModel.findOneAndUpdate(
      { bubbleName: bubblename },
      toUpdate,
      {
        new: true,
        upsert: true,
      }
    );
  }
}

module.exports = { Bubble };
