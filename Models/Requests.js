const mongoose = require("mongoose");

const Request = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    toUserId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    status:{
        type: String
    }
});

module.exports = mongoose.model("requests", Request);
