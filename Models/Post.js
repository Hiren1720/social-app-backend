const mongoose = require("mongoose");

const Post = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    imageUrl:{
        type: String
    },
    hashTags:{
      type:Array
    },
    title:{
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    likes: {
        type: Array
    },
    comments:{
        type: Array
    },
},{
    timestamps:true,
    versionKey: false
});

module.exports = mongoose.model("posts", Post);
