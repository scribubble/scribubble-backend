const mongoose = require("mongoose");

const bubbleSchema = new mongoose.Schema({
    bubbleName: String,
    owner_id: String,
    visitor_id: [ String ],
    line: [{
        drawer_id: String,
        linePositions: [{
            x: Number,
            y: Number,
            z: Number
        }],
        lineColor: String,
        lineWidth: Number,
        lineDashed: Boolean,
        name: String,
        position: {
            x: Number,
            y: Number,
            z: Number,
        },
    }],
    shape: [{
        name: String,
        shape: String,
        position: {
            x: Number,
            y: Number,
            z: Number
        } 
    }]
});

const Bubble = mongoose.model('Bubble', bubbleSchema);

module.exports = { Bubble };