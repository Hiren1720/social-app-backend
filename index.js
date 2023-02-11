const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const UserRoutes = require("./Routes/UserRoutes");
const PostRoutes = require("./Routes/PostRoutes");
const RequestRoutes = require("./Routes/RequestRoutes");
const FollowersRoute = require("./Routes/FollowersRoute");
const AdminRoutes = require("./Routes/AdminRoutes");
const CommentRoutes = require("./Routes/CommentRoutes");
// var multer = require('multer');
// var upload = multer();
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
// app.use(upload.array());
// app.use(express.static('public'));
const port = process.env.PORT || 8080



mongoose.connect(process.env.MONGO_DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DataBase Connected");
    }).catch((err) => {
        console.log("Connection Error:-",err.message);
    });

app.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`)
})

app.use("/api/user", UserRoutes);
app.use("/api/request", RequestRoutes);
app.use("/api/follower", FollowersRoute);
app.use("/api/post", PostRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/comment", CommentRoutes);

