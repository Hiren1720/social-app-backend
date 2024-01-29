// const {postLike} = require("./Controllers/PostController");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const UserRoutes = require("./Routes/UserRoutes");
const PostRoutes = require("./Routes/PostRoutes");
const RequestRoutes = require("./Routes/RequestRoutes");
const FollowersRoute = require("./Routes/FollowersRoute");
const AdminRoutes = require("./Routes/AdminRoutes");
const StoryRoutes = require("./Routes/StoryRoutes");
const {connectedClients} = require('./Utils/helper');
const Ably = require('ably');
const app = express();
require("dotenv").config();
const corsOptions = {
    origin: [ 'https://social-v1-app.vercel.app', 'http://localhost:3000' ,'https://api.cloudinary.com/v1_1/'],
    credentials: true,
    optionSuccessStatus: 200

}
app.use(cors(corsOptions));
app.use(express.json());
app.use(express());

// app.use(express.static('public'));
const port = process.env.PORT || 8080
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
// mongoose.connect(process.env.MONGO_DB_URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then(() => {
//         console.log("DataBase Connected");
//     }).catch((err) => {
//         console.log("Connection Error:-",err.message);
//     });

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

// let server = http.createServer(app);
app.get('/stream', handleSSE)
app.use("/api/user", UserRoutes);
app.use("/api/request", RequestRoutes);
app.use("/api/follower", FollowersRoute);
app.use("/api/post", PostRoutes);

app.use("/api/story", StoryRoutes);
app.use("/api/admin", AdminRoutes);

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`server is working on http://localhost:${port}`);
    })
})
// server.listen(port, () => {
//     console.log(`server is working on http://localhost:${port}`)
// })
const ably = new Ably.Realtime.Promise({key:"PbeIpA.eZ-G_A:pz_TrYgruXMbVoNloJZiCill0ek7pJpw3nV3zEnueJ4"});
const ablyRealtimePromiseExample = async () => {
    // const ably = new Ably.Realtime.Promise('eyJ0eXAiOiJKV1QiLCJ2ZXJzaW9uIjoxLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmMzEyNzlkMy03OTM1LTRhYzgtOGFkMy05M2UwMDNlYjFhNWMiLCJpc3MiOiJhYmx5LmNvbSIsImlhdCI6MTY5MjI5MTA4MSwic3ViIjo0MzQ4Mn0.od30Uh34SboEs1FpmrSOvy9q4sV0muiKMyZzrL-B2ns');
    // setInterval(async ()=> {
        await ably.connection.once('connected');
    // },2000)
    // await ably.connection.once('connected');
    console.log('Connected to Ably!');

    // get the channel to subscribe to
    const channel = ably.channels.get("social-app");

    /*
      Subscribe to a channel.
      The promise resolves when the channel is attached
      (and resolves synchronously if the channel is already attached).
    */
    await channel.subscribe("like", async (message) => {
        const data = await postLike(message.data)
        await channel.publish('liked',{...data?.data,userName:message?.data?.userName,likedBy:message.data?.likeBy,isLiked: data?.msg === 'liked'})
        // ably.close();
        // await ably.connection.once('connected');
    });

    // Publish a message or two
    // await channel.publish("greeting", "hello!");
    // await channel.publish("greeting", "hello!");
    // await channel.publish("greeting", "hello!");

    // wait 2s to receive all messages and then shut down
    // setTimeout(() => {
    //     console.log("Closing connection...");
    //     ably.close();
    //     console.log("Closed the connection to Ably.");
    // }, 2000);
};

// call wrapper
// ablyRealtimePromiseExample();

