const mongoose = require("mongoose");

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 50,
    },
    password:{
        type:String,
        required: true,
    },
    birthDate:{
        type: Date,
        required: true,
    },
    gender:{
        type: String,
        required: true,
    },
    hobby: {
        type: Array,
        required: true,
    },
    contact:{
        type: Number,
        required: true
    },
    followers:{
      type: Array,
    },
    following:{
      type:Array
    },
    state: {
        type: String,
        required: true
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
