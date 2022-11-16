import { Request, Response } from "express";

const express = require("express");
//Instanciando servidor
const app = express();
const http = require("http");
const cors = require("cors");
const UserList = require("./utils/user");
const VideoList = require("./utils/video");
//Instanciando a classe de usuários
const users = new UserList();
//Instanciando a classe de videos
const videos = new VideoList();

const { Server } = require("socket.io");

//Definindo uso do cors
app.use(cors());

//Rota para obter os usuários em determinada sala
app.get("/users/:room", (req: Request, res: Response) => {
  const room = req.params.room;
  const userList = users.getUserList(room);
  return res.json(userList);
});

//Rota para obter o video atual de determinada sala
app.get("/video/:room", (req: Request, res: Response) => {
  const room = req.params.room;
  const videoId = videos.getVideo(room);
  return res.json(videoId);
});

//Instanciando o servidor do express com http para utilização no socket io
const server = http.createServer(app);

//Instanciando servidor do socket io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
  //Quando um usuário entrar em determinada sala
  socket.on("join_room", (data: any) => {
    //Efetua a conexão do usuário com outros presentes mesma na sala
    socket.join(data.room);

    //Remove o usuário da lista de usuários se ele já existir(feito para não duplicar um mesmo usuário)
    users.removeUser(socket.id);

    //Adiciona o usuário na lista de usuário
    users.addUser(socket.id, data.user, data.room);

    //Comunica a todos da sala o evento de que o usuário entrou
    socket.to(data.room).emit("joined_user", data.user);

    //Exibe no console usuário que entrou, apenas para dev
    console.log(`USER ID: ${socket.id} JOINED ROOM: ${data.room}`);

    //Comunica a todos da sala para atualizar a lista de usuários
    socket.to(data.room).emit("updateUserList", users.getUserList(data.room));
  });

  //Quando um usuário enviar uma mensagem
  socket.on("send_message", (data: any) => {
    //Comunica a todos da sala a mensagem que o usuário enviou
    socket.to(data.room).emit("receive_message", data);
  });
  socket.on("played_video", (data: any) => {
    socket.to(data.room).emit("updateVideoTime", data.time);
  });
  //Quando um usuário definir um video
  socket.on("set_video", (data: any) => {
    //Emite um cominucado a todos do id do video a ser definido
    socket.to(data.room).emit("receive_videoid", data.id);

    //Remove o video da lista de videos caso já esteja definido
    videos.removeVideo(data.room);

    //Adiciona o video na lista de videos, essa informação é salva para que quando um novo usuário entre na sala ele possa reproduzir o mesmo video que alguém já definiu
    videos.addVideo(data.id, data.room);
  });

  //Evento para quando um usuário se desconectar
  socket.on("disconnect", () => {
    //Remove o usuário da lista de usuários
    let user = users.removeUser(socket.id);
    if (user) {
      //Se o usuário existir, emite um comunicado pra lista de usuários ser atualizada
      socket.to(user.room).emit("updateUserList", users.getUserList(user.room));
    }

    //Console pra mostrar o usuário que está saindo, apenas dev
    console.log("user leaving", socket.id);
  });
});

//Executa o servidor na porta a ser definida no .env ou utiliza a 3001 caso não esteja definida
server.listen(process.env.PORT || 3001, () => {
  console.log("Running");
});
