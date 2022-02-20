const mongoose = require('mongoose');
const { Schema } = mongoose;

const vectorSchema = new Schema({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 0 },
});

const Vec = mongoose.model("Vec", vectorSchema);

const lineSchema = new Schema({
  drawer_id: { type: String, default: '' },
  linePositions: { type: [vectorSchema], default: [] },
  lineColor: { type: String, default: '#000000' },
  lineWidth: { type: Number, default: 0 },
  lineDashed: { type: Boolean, default: false },
  objName: { type: String, default: '' },
  position: { type: vectorSchema, default: {}},
  tfcPosition: { type: vectorSchema, default: {}},
  tfcScale: { type: vectorSchema, default: {}},
  tfcRotation: { type: vectorSchema, default: {}},
});

const Line = mongoose.model("Line", lineSchema);

const shapeSchema = new Schema({
  objName: { type: String, default: '' },
  shape: { type: String, default: '' },
  color: { type: String, default: '#000000' },
  position: { type: vectorSchema, default: {}},
  scale: { type: vectorSchema, default: {}},
  rotation: { type: vectorSchema, default: {}},
});

const Shape = mongoose.model("Shape", shapeSchema);

const bubbleSchema = new Schema({
  bubbleName: { type: String, default: '' },
  owner_id: { type: String, default: '' },
  visitor_id: [{ type: String, default: '' }],
  lines: { type: [lineSchema], default: [] },
  shapes: { type: [shapeSchema], default: [] },
});

const Bubble = mongoose.model("Bubble", bubbleSchema);

module.exports = { Bubble, Line, Shape, Vec };
