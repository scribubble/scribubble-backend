const { Schema, model } = require("mongoose");

const vector0Schema = new Schema({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 0 },
});

const vector1Schema = new Schema({
    x: { type: Number, default: 1 },
    y: { type: Number, default: 1 },
    z: { type: Number, default: 1 },
  });

const lineSchema = new Schema({
  drawer_id: { type: String, default: '' },
  linePositions: [ vector0Schema ],
  lineColor: { type: String, default: '#000000' },
  lineWidth: { type: Number, default: 0 },
  lineDashed: { type: Boolean, default: false },
  objName: { type: String, default: '' },
  position: { type: vector0Schema, default: () => ({}) },
  tfcPosition: { type: vector0Schema, default: () => ({}) },
  tfcScale: { type: vector1Schema, default: () => ({}) },
  tfcRotation: { type: vector0Schema, default: () => ({}) },
});

const shapeSchema = new Schema({
  objName: { type: String, default: '' },
  shape: { type: String, default: '' },
  color: { type: String, default: '#000000' },
  position: { type: vector0Schema, default: () => ({}) },
  scale: { type: vector1Schema, default: () => ({}) },
  rotation: { type: vector0Schema, default: () => ({}) },
});

const bubbleSchema = new Schema({
  bubbleName: { type: String, default: '' },
  owner_id: { type: String, default: '' },
  visitor_id: [{ type: String, default: '' }],
  lines: [ lineSchema ],
  shapes: [ shapeSchema ],
});

const BubbleModel = model("Bubble", bubbleSchema);

module.exports = { BubbleModel };
