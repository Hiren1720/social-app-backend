const mongoose = require("mongoose");

const VisitorTime = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    time:{
        type: Number,
        required:true
    },
    date:{
        type: String
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

module.exports = mongoose.model("visitors_time", VisitorTime);
