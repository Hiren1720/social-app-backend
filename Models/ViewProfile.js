const mongoose = require("mongoose");

const ViewProfile = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId
    },
    viewerId:{
        type: mongoose.Types.ObjectId,
    }
},{
    timestamps: true,
    versionKey:false,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            return ret;
        },
    }
});

module.exports = mongoose.model("view-profile", ViewProfile);