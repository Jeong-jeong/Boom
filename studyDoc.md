## 1. 서버 설정

### express와 nodemon

`Node.js`는 js로 브라우저가 아닌 서버를 구축하고, 서버에서 JS가 작동할 수 있게 해주는 런타임 환경이다. [(참고)](https://ninjaggobugi.tistory.com/9) <br>
`express`는 Node.js를 서버에서 좀더 활용하기 쉽도록 만든 프레임워크이다. 프론트엔드에서 js를 SPA로 좀 더 쉽게 만들기 위해 리액트와 같은 라이브러리(프레임워크)를 사용하는 것과 같은 같은 맥락이다.<br>
<br>
**템플릿 엔진**이란?<br>
html 코드를 매번 만들 필요없이 최소화하도록 도와주는 템플릿이다.

```js
// src/server.js
import express from "express"; // ES6 모듈로 express 모듈 가져오기

const app = express(); // express 객체 생성
const port = 3000;

// 서버 템플릿 설정
app.set("view engine", "pug"); // 템플릿 엔진을 pug로 설정
app.set("views", __dirname + "/views"); // pug 파일 위치 설정
app.use("/public", express.static(__dirname + "/public")); // 정적 파일을 제공할 폴더의 가상 경로 설정

// route 설정
app.get("/", (req, res) => res.render("home")); // pug 파일 중 home 렌더
app.get("/*", (req, res) => res.redirect("/")); // 유저가 어디로 가든 home으로 리다이렉트

// port 설정
const handleListen = () => console.log(`Listening on http://localhost:${port}`);
app.listen(port, handleListen);
```

src 폴더 내부에 views 폴더를 만들고 사용될 pug 파일들을 넣어준다.

```pug
//- src/views/home.pug
doctype html
html(lang="en")
	head
		meta(charset="UTF-8")
		meta(http-equiv="X-UA-Compatible", content="IE=edge")
		meta(name="viewport", content="width=device-width, initial-scale=1.0")
		title Boom
	body
		script(src="/public/js/app.js")
```

그렇다면 nodemon은 무엇일까?<br>
`nodemon`은 소스가 수정될 때마다 자동으로 서버를 재구동시켜준다. `babel-node`를 사용해 최신 js 문법들을 common.js 모듈로 바꿔주므로 서버사이드에서 사용하기 위함(?)이다.

```json
// nodemon.json
{
  "ignore": ["src/public/*"], // 저장해도 새로고침 안할 위치
  "exec": "babel-node src/server.js" // server.js 파일을 babel이 common.JS 모듈로 컴파일 해줌. -> 서버사이드에서 사용하기 위함
}
```

터미널에 yarn dev / npm run dev을 입력 시 nodemon이 nodemon.json을 실행시킨다.

```json
// package.json
"scripts": {
    "dev": "nodemon"
  },
```

<br>

### MVP css 로 기본 css를 예쁘게 꾸며주기

`mvp.css`는 reset, normalize.css와 달리 코드 한줄로 기본 스타일을 예쁘게 꾸며주는 데 사용된다.

```pug
link(rel="stylesheet", href="https://unpkg.com/mvp.css")
```

| mvp 사용 전                                                                                                                               | mvp 사용 후                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| <img width="378" alt="image" src="https://user-images.githubusercontent.com/68528752/158063226-874a0da6-2113-4a24-b460-a718eec1ef8a.png"> | <img width="381" alt="image" src="https://user-images.githubusercontent.com/68528752/158063248-fdd8bbc3-baa1-4400-8128-79dea2556128.png"> |

## 2. 채팅에 WebSockets 활용하기

![ezgif com-gif-maker-20](https://user-images.githubusercontent.com/68528752/158123063-e3a889de-a735-4c01-a2cf-f91bd4316613.gif)

### HTTP VS WebSockets

**http** <br>
http는 stateless, connectionless 하기 때문에 요청과 응답이 이루어지면 연결이 끊긴다. node.js에 기본으로 http가 있으므로 따로 설치할 필요가 없다.<br>

**WebSocket**<br>
webSocket도 일종의 프로토콜로, http와 정반대로 connection을 유지해 실시간 통신이 가능하게 한다. node.js에서 websocket을 활용하기 위해 `ws 패키지`를 활용할 것이다. 다만 채팅방 로직을 ws 만으로 구현하긴 어렵기 때문에 ws를 사용하는 프레임워크인 `Socket.io`를 나중에 활용해보고자 한다.

### websocket으로 서버와 브라우저를 연결하기

Websocket은 위에서 언급했듯이 프로토콜이기 때문에, http나 ws 프로토콜(Websocket 프로토콜)만 바꾸고 동일한 호스트를 사용할 수 있다. 이를 위해 http로 서버를 만들고, Websocket에 서버를 넘겨줘서 동일한 호스트로 프로토콜만 바꾸어 재사용할 수 있게 만들어보겠다.

```js
// server.js
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // http 서버 위에 wss 서버 설정
```

- 브라우저와 연결하기

```js
// server.js
wss.on("connection", (socket) => {
  // socket === 연결된 소켓의 정보가 객체 형태로 담김

  // 브라우저와 연결이 끊겼을 때 처리
  socket.on("close", () => console.log("브라우저 연결이 끊겼습니다 "));
});
```

- 서버와 연결하기
  양방향 통신이므로 브라우저에서도 서버와 웹소켓으로 연결해야 한다. 하드코딩으로 호스트 주소를 적는 것보다 `window.location`에서 host 정보를 동적으로 가져올 수 있다.

```js
// app.js
const { host } = window.location;
const socket = new WebSocket(`ws://${host}`);

socket.addEventListener("open", () => {
  // 서버와 연결됐을 때
  console.log("서버와 연결되었습니다 🚀");
});

socket.addEventListener("close", () => {
  // 서버와 연결이 끊겼을 때 (탭을 끄거나, 브라우저를 끄거나...)
  console.log("서버와 연결이 끊어졌습니다 👋");
});
```

### Websocket으로 메세지 주고 받기

submit 이벤트나 버튼 click 이벤트가 발생하면 `submitMessage` 이벤트를 실행시킨다.
추후 닉네임 설정을 위해 submitMessage의 두번째 인자로 `type(message, nickname)`을 받을 것이다.
이벤트가 발생하면 input 값을 가져와 payload에 넣고, JSON 형태로 서버에 보낸다.
메세지를 보낼 때는 socket 객체의 `send 메서드`를 사용한다.

```js
// app.js
$messageForm.addEventListener("submit", (e) => submitMessage(e, "message"));
$messageButton.addEventListener("click", (e) => submitMessage(e, "message"));

function submitMessage(e, type) {
  e.preventDefault();
  const form = e.target.closest("form");
  const payload =
    form.className === "nicknameForm"
      ? $nicknameInput.value
      : $messageInput.value;
  const data = {
    type,
    payload,
  };
  socket.send(JSON.stringify(data));

  $messageInput.value = "";
}
```

#### 닉네임 저장, 다양한 사용자 구분

브라우저에서 발생한 send 이벤트를 통해 서버는 메세지를 받을 수 있다.
여기서 중요한 것은 **다양한 사용자를 구분하기 위해** 매개변수로 받은 socket 객체를 **배열에 저장**하고, 순회하며 다시 브라우저로 메세지를 보내주는 것이다. 또한 socket은 객체이기 때문에 프로퍼티를 추가할 수 있다. 이를 이용해 처음 연결시 nickname 프로퍼티를 '익명의 사용자'로 초기화하고, message 이벤트가 발생 시 type에 따라 구분해 닉네임을 넣어주는 것이다.

```shell
💡 정리
	1. sockets 배열에 연결된 socket 객체를 넣고, 메세지를 받으면 순회하며 브라우저로 재전송
	2. 브라우저로부터 받은 데이터 type을 구분해 message면 보내주고, nickname이면 socket nickname 프로퍼티에 저장.
	3. 처음 초기화시엔 socket nickname 프로퍼티에 익명의 사용자로 초기화.
```

```js
// server.js
const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "익명의 사용자"; // 닉네임 초기화

  socket.on("message", (message) => {
    const { type, payload } = JSON.parse(message);
    sockets.forEach((eachSocket) => {
      switch (type) {
        case "message":
          eachSocket.send(`${socket.nickname} :${payload}`);
          break;
        case "nickname":
          socket["nickname"] = payload;
          break;
        default:
          throw Error("알 수 없는 type 입니다.");
      }
    });
  });
  // ... 생략
});
```

### 서버로부터 재전송받은 메세지의 list 동적 생성

```js
socket.addEventListener("message", ({ data }) => {
  // 서버에서 send로 메세지 전송시 받을 수 있음.
  const $messageItem = document.createElement("li");
  $messageItem.innerText = data;
  $messageList.appendChild($messageItem);
});
```

### Websocket의 한계

1. 문자열이 아닌 데이터는 JSON 형태로 변환이 필요하다.
2. 보내는 메세지를 구분할 기능이 존재하지 않는다.
3. 다양한 사용자를 구분할 방의 구현을 따로 해야한다.

## 3. 채팅에 Socket.io 활용하기

### websocket VS socket.io

- socket.io는 `프레임워크`로, webSocket을 사용할 수 있는 환경이면 그것을 사용하고, 아닐 경우 `HTTP long-polling`과 같은 다른 수단을 사용한다.
- 연결에 실패해도 재연결을 시도한다.
- websocket보다 용량이 크다.

### 서버와 브라우저 연결하기

socket.io를 설치 후 Server와 브라우저에 각각 연결을 먼저 해준다.

```js
// server.js
import { Server } from "socket.io";

const server = http.createServer(app);
const io = new Server(server); // http로 만든 서버를 인수로 전달

io.on("connection", () => {
  // 연결 후 실행할 로직들 작성
});
```

브라우저에 설치할 다양한 방법들이 있지만, 여기선 script를 통해 global scope로 연결할 것이다. 기타 다른 방법들은 [socket.io for Client API](https://socket.io/docs/v4/client-api/#socketopen)에서 확인!
script로 연결하면 global scrope로 io 함수를 호출할 수 있다. io 함수는 자동으로 socket.io를 실행하는 서버를 찾아준다 👏👏.

```js
// home.pug
<script src="/socket.io/socket.io.js"></script>;

// app.js
const socket = io();
```

브라우저에서 서버로 이벤트를 보낼 때는 `emit` 메서드를,
이벤트를 받을 때는 `on` 메서드를 사용한다.

```js
socket.emit('임의의 이벤트', 보낼 데이터들, callback);

socket.on("임의의 이벤트", callback);
```

callback은 이벤트 요청 이후 **서버로부터** 받는 callback이다. 클라이언트에서 emit, on 이벤트를 보냄과 동시에 서버가 실행하고 브라우저에서 받을 수 있는 엄청난 기능이다 ㄷㄷ.

## Rooms

1대 1, 1대 다 등 어떠한 그룹을 생성하기 위해선 socket.io의 room 기능을 사용하면 된다.

```js
// server.js
socket.join(룸 이름) // room 참가
socket.leave(룸 이름) // room leave
```

`socket.to`는 해당 room에 있는 **나를 제외한** 모든 사용자에게 특정 이벤트를 보낼 수 있는 기능이다.

```js
socket.to(roomName).emit("newMessage", `${socket.nickname} : ${message}`);
```
