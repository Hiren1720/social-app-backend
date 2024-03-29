const mongoose = require("mongoose");

const Post = new mongoose.Schema({
    content: {
        type: String
    },
    imageUrl:{
        type: Array
    },
    hashTags:{
      type:Array
    },
    mentions:{
        type:Array
    },
    title:{
        type: String
    },
    device:{
        type: String
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
    savedBy:{
        type:Array
    }
},{
    timestamps:true,
    versionKey: false
});

module.exports = mongoose.model("posts", Post);
