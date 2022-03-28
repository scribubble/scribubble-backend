const { Bubble } = require("../db");

class resetService {
  static reset() {
    Bubble.deleteAll().then(() => {
      loadedData = [];
      console.log("All data has removed");
    });
  }
}

module.exports = { resetService };
