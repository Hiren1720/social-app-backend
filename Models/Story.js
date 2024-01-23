const mongoose = require("mongoose");

const Story = new mongoose.Schema({
    userName:{
        type: String,
    },
    story_url:{
        type: Array,
    },
    userId:{
        type: mongoose.Types.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
    },
    // expireAt:{
    //     type:Date,
    //     expires: 24 * 60 * 60,
    // }
},{
    timestamps:true,
    versionKey: false
});

module.exports = mongoose.model("storys", Story.index( {
    expireAfterSeconds: 60 * 60 * 24, // expire after 24 hours
}));
