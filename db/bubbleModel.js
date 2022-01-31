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
        position: [ String ],
        scale: [ String ],
        rotation: [ String ]
    }],
    text: [ 
        { _id: Number, html: String, tagName: String }
    ],
    picture: [ String ]
});

const Bubble = mongoose.model('Bubble', bubbleSchema);

module.exports = { Bubble };