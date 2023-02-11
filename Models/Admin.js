const mongoose = require("mongoose");

const Admin = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    birth_date:{
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
    color: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("admins", Admin);
