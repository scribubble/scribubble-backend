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
            x: Number
        }],
        lineColor: String,
        lineWidth: Number,
        lineDashed: Boolean,
        name: String,
        position: [ String ],
        scale: [ String ],
        rotation: [ String ]
    }],
    shape: [{
        shape: String,
        position: {
            x: Number,
            y: Number,
            z: Number
        } 
    }],
    text: [ 
        { _id: Number, html: String, tagName: String }
    ],
    picture: [ String ]
});

const Bubble = mongoose.model('Bubble', bubbleSchema);

module.exports = { Bubble };