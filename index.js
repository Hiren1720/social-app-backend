const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const UserRoutes = require("./Routes/UserRoutes");
const PostRoutes = require("./Routes/PostRoutes");
const RequestRoutes = require("./Routes/RequestRoutes");
const FollowersRoute = require("./Routes/FollowersRoute");
const AdminRoutes = require("./Routes/AdminRoutes");
const {connectedClients} = require('./Utils/helper')
const app = express();
require("dotenv").config();
const corsOptions = {
    origin: [ 'https://social-v1-app.vercel.app', 'http://localhost:3000' ],
    credentials: true,
    optionSuccessStatus: 200

}
app.use(cors(corsOptions));
app.use(express.json());
app.use(express());

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
    res.setHeader('Access-Control-Allow-Origin', 'https://social-v1-app.vercel.app');
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res,
    };
    connectedClients.set(clientId, newClient);
    req.on('close', () => {
        connectedClients.delete(clientId);
        console.log('SSE closed')
    });
}


let server = http.createServer(app);
// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', "http://localhost:3000");//https://social-v1-app.vercel.app/login
//     res.header('Access-Control-Allow-Headers', true);
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     next();
// });
app.get('/stream', handleSSE)
app.use("/api/user", UserRoutes);
app.use("/api/request", RequestRoutes);
app.use("/api/follower", FollowersRoute);
app.use("/api/post", PostRoutes);
app.use("/api/admin", AdminRoutes);

server.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`)
})

