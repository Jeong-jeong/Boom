## 1. 서버 설정

### express와 nodemon

`Node.js`는 js로 브라우저가 아닌 서버를 구축하고, 서버에서 JS가 작동할 수 있게 해주는 런타임 환경이다. [(참고)](https://ninjaggobugi.tistory.com/9) <br>
**express**는 Node.js를 서버에서 좀더 활용하기 쉽도록 만든 프레임워크이다. 프론트엔드에서 js를 SPA로 좀 더 쉽게 만들기 위해 리액트와 같은 라이브러리(프레임워크)를 만든 것과 같은 맥락이다.<br>
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
app.get("/", (req, res) => res.render("home")); // pug 파일중 home 렌더

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
`nodemon`은 소스가 수정될 때마다 자동으로 서버를 재구동시켜주기 때문에 편하다.

```json
// nodemon.json
{
  "ignore": ["src/public/*"], // 저장해도 새로고침 안할 위치
  "exec": "babel-node src/server.js" // nodemon이 watch할 대상
}
```

터미널에 yarn dev / npm run dev을 입력 시 nodemon이 nodemon.json을 실행시킨다.

```json
// package.json
"scripts": {
    "dev": "nodemon"
  },
```
