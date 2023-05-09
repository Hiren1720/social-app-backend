const mongoose = require("mongoose");

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userName:{
        type: String,
    },
    email: {
        type: String,
        unique: true,
        max: 50,
    },
    password:{
        type:String,
    },
    birthDate:{
        type: Date,
    },
    gender:{
        type: String,
    },
    hobby: {
        type: Array,
    },
    contact:{
        type: Number,
    },
    followers:{
      type: Array,
    },
    following:{
      type:Array
    },
    profile_url:{
      type: String,
    },
    state: {
        type: String,
    },
    status: {
        type: Boolean,
    },
},{
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            return ret;
        },
    }
});

module.exports = mongoose.model("users", User);
