import { Request, Response } from "express";

const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const UserList = require("./utils/user");
const VideoList = require("./utils/video");
const users = new UserList();
const videos = new VideoList();
const { Server } = require("socket.io");

app.use(cors());

app.get("/users/:room", (req: Request, res: Response) => {
  const room = req.params.room;
  const userList = users.getUserList(room);
  return res.json(userList);
});

app.get("/video/:room", (req: Request, res: Response) => {
  const room = req.params.room;
  const videoId = videos.getVideo(room);
  return res.json(videoId);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
  socket.on("join_room", (data: any) => {
    socket.join(data.room);

    users.removeUser(socket.id);
    users.addUser(socket.id, data.user, data.room);

    socket.to(data.room).emit("joined_user", data.user);
    console.log(`USER ID: ${socket.id} JOINED ROOM: ${data.room}`);

    socket.to(data.room).emit("updateUserList", users.getUserList(data.room));
  });

  socket.on("send_message", (data: any) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("set_video", (data: any) => {
    socket.to(data.room).emit("receive_videoid", data.id);
    videos.addVideo(data.id, data.room);
  });

  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    if (user) {
      socket.to(user.room).emit("updateUserList", users.getUserList(user.room));
    }

    console.log("user leaving", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Running");
});
