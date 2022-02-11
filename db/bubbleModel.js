const mongoose = require('mongoose');
const { Schema } = mongoose;

const lineSchema = new Schema({
  drawer_id: { type: String, default: '' },
  linePositions: [
    {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
  ],
  lineColor: { type: String, default: '#000000' },
  lineWidth: { type: Number, default: 0 },
  lineDashed: { type: Boolean, default: false },
  objName: { type: String, default: '' },
  tfcPosition: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  tfcScale: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  tfcRotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
});

const Line = mongoose.model("Line", lineSchema);

const shapeSchema = new Schema({
  objName: { type: String, default: '' },
  shape: { type: String, default: '' },
  color: { type: String, default: '#000000' },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  scale: {
    x: { type: Number, default: 1 },
    y: { type: Number, default: 1 },
    z: { type: Number, default: 1 },
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
});

const Shape = mongoose.model("Shape", shapeSchema);

const bubbleSchema = new Schema({
  bubbleName: { type: String, default: '' },
  owner_id: { type: String, default: '' },
  visitor_id: [{ type: String, default: '' }],
  line: [ lineSchema ],
  shape: [ shapeSchema ],
});

const Bubble = mongoose.model("Bubble", bubbleSchema);

module.exports = { Bubble, Line, Shape };
