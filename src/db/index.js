const mongoose = require("mongoose");
const { Bubble } = require("./models/Bubble");

const DB_URL = process.env.DB_URL || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_COLLECTION = process.env.DB_COLLECTION || "scribubble";
const DB_CONNECTIONSTRING = "mongodb://" + DB_URL + ":" + DB_PORT + "/" + DB_COLLECTION;

mongoose.connect(DB_CONNECTIONSTRING);

const db = mongoose.connection;

db.on("connected", () => console.log("DB is connected. " + DB_CONNECTIONSTRING));
db.on("error", (error) => console.error("DB connection has failed.\n" + DB_CONNECTIONSTRING + "\n" + error));

module.exports = { Bubble };