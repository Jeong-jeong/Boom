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
