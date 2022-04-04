import http from "http";
import express from "express"; // ES6 모듈로 express 모듈 가져오기
import { Server } from "socket.io";

const app = express(); // express 객체 생성
const port = 3000;

// 서버 템플릿 설정
app.set("view engine", "pug"); // 템플릿 엔진을 pug로 설정
app.set("views", __dirname + "/views"); // pug 파일 위치 설정
app.use("/public", express.static(__dirname + "/public")); // 정적 파일을 제공할 폴더의 가상 경로 설정

// route 설정
app.get("/", (req, res) => res.render("home")); // pug 파일중 home 렌더
app.get("/*", (req, res) => res.redirect("/")); // 유저가 어디로 가든 home으로 리다이렉트

const handleListen = () => console.log(`Listening on http://localhost:${port}`);

// 한 서버에서 http, websocket 서버 함께 설정 -> 한 localhost로 둘다 핸들
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  socket.onAny((e) => {
    console.log(`Socket Event: ${e}`);
  });
  socket.on("enterRoom", ({ roomName, nickname }, enterComplete) => {
    socket["nickname"] = nickname;
    socket.join(roomName);
    enterComplete(roomName);
    socket.to(roomName).emit("welcome", nickname);
  });

  socket.on("newMessage", ({ message, roomName }, submitMessage) => {
    submitMessage(message);
    socket.to(roomName).emit("newMessage", `${socket.nickname} : ${message}`);
  });
});
// const wss = new WebSocket.Server({ server }); // http 서버 위에 wss 서버 설정

// const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "익명의 사용자";

//   socket.on("message", (message) => {
//     const { type, payload } = JSON.parse(message);
//     sockets.forEach((eachSocket) => {
//       switch (type) {
//         case "message":
//           eachSocket.send(`${socket.nickname} :${payload}`);
//           break;
//         case "nickname":
//           socket["nickname"] = payload;
//           break;
//         default:
//           throw Error("알 수 없는 type 입니다.");
//       }
//     });
//   });
//   socket.on("close", () => console.log("브라우저 연결이 끊겼습니다 "));
// });

server.listen(port, handleListen);
