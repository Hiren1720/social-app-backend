const mongoose = require("mongoose");

const Request = new mongoose.Schema({
    fromUserId: {
        type: String,
        required: true,
    },
    toUserId:{
        type: String,
        required: true
    },
    status:{
        type: String
    }
});

module.exports = mongoose.model("requests", Request);
