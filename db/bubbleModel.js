const mongoose = require("mongoose");

const bubbleSchema = new mongoose.Schema({
    bubbleName: String,
    owner_id: String,
    user_id: [ String ],
    line: [{
        linePositions: [{
            x: Number,
            y: Number,
            x: Number
        }],
        lineColor: String,
        lineWidth: Number,
        position: [ String ],
        scale: [ String ],
        rotation: [ String ]
    }],
    text: [ String ],
    picture: [ String ]
});

const Bubble = mongoose.model('Bubble', bubbleSchema);

module.exports = { Bubble };