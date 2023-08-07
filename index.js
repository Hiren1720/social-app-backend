const {postLike} = require("./Controllers/PostController");

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
const Comment = require("./Models/Comment");
const Post = require("./Models/Post");
const {connectedClients} = require('./Utils/helper')
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

const handleSSE = (req,res) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res,
    };
    connectedClients.set(clientId, newClient);
    req.on('close', () => {
        connectedClients.delete(clientId);
        console.log('closed')
    });
}


let server = http.createServer(app);
const sockets = {};
app.set('sockets', sockets);
app.get('/stream', handleSSE)
app.use("/api/user", UserRoutes);
app.use("/api/request", RequestRoutes);
app.use("/api/follower", FollowersRoute);
app.use("/api/post", PostRoutes);
app.use("/api/admin", AdminRoutes);
app.use(express.static('Photos'));

const io = socket(server,{ origins: '*:*' });
io.on('connection',(socket)=>{

    socket.on('joinUserId',(userId)=>{
        socket.join(userId);
    })

//     socket.on('commentNotification',(data)=>{
//         let comment = new Comment({content:data?.content,createdBy:data?.createdBy,postId:data?.postId});
//         comment.save(async function (error, document) {
//             if (!error && document?.postId) {
//                 await Post.findOneAndUpdate({_id: document?.postId}, {$push: {"comments": document?._id}});
//                 socket.broadcast.to(data?.id).emit("comment", {
//                     text: `${data?.userName} Commented on your post`,
//                     postId:document?.postId,
//                     commentId:document?._id
//                 });
//             }
//         });
//     })
//     socket.on('likeNotification',async (data)=>{
//         let like = await postLike(data);
//         if(like){
//             socket.broadcast.to(data.id).emit('like',{
//                 text: `${data?.userName} Like your post`
//             })
//         }
//     })
})

server.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`)
})

