const mongoose = require('mongoose');

const { bubbleSchema, lineSchema, shapeSchema, vector0Schema, vector1Schema } = require('./schemas');

const Bubble = mongoose.model("Bubble", bubbleSchema);

module.exports = { Bubble };
