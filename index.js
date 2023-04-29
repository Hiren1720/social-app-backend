const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socket= require('socket.io');
const UserRoutes = require("./Routes/UserRoutes");
const PostRoutes = require("./Routes/PostRoutes");
const RequestRoutes = require("./Routes/RequestRoutes");
const FollowersRoute = require("./Routes/FollowersRoute");
const AdminRoutes = require("./Routes/AdminRoutes");
const CommentRoutes = require("./Routes/CommentRoutes");
const Comment = require("./Models/Comment");
const Post = require("./Models/Post");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express());

// app.use(upload.array());
// app.use(express.static('public'));
const port = process.env.PORT || 8080
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DataBase Connected");
    }).catch((err) => {
        console.log("Connection Error:-",err.message);
    });


let server = http.createServer(app);
const sockets = {};
app.set('sockets', sockets)
app.use("/api/user", UserRoutes);
app.use("/api/request", RequestRoutes);
app.use("/api/follower", FollowersRoute);
app.use("/api/post", PostRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/comment", CommentRoutes);
app.use(express.static('Photos'));

const io = socket(server,{ origins: '*:*' });
io.on('connection',(socket)=>{

    socket.on('joinUserId',(userId)=>{
        socket.join(userId);
    })

    socket.on('commentNotification',(data)=>{
        let comment = new Comment({content:data?.content,createdBy:data?.createdBy,postId:data?.postId});
        comment.save(async function (error, document) {
            if (!error && document?.postId) {
                await Post.findOneAndUpdate({_id: document?.postId}, {$push: {"comments": document?._id}});
                socket.broadcast.to(data?.id).emit("message", {
                    text: `${data?.userName} Commented on your post`,
                });
                socket.emit("messageFrom", {
                    text: 'Commented'
                });
            }
        });
    })
})

server.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`)
})

