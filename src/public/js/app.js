// backend와 socket 연결

const { host } = window.location;
const $messageList = document.querySelector("ul");
const $messageForm = document.querySelector(".messageForm");
const $messageInput = document.querySelector(".messageForm > input");
const $messageButton = document.querySelector(".messageForm > button");
const $nicknameForm = document.querySelector(".nicknameForm");
const $nicknameInput = document.querySelector(".nicknameForm > input");
const $nicknameButton = document.querySelector(".nicknameForm > button");

const socket = new WebSocket(`ws://${host}`);
socket.addEventListener("open", () => {
  console.log("서버와 연결되었습니다 🚀");
});

$messageInput.focus();

socket.addEventListener("message", ({ data }) => {
  const $messageItem = document.createElement("li");
  $messageItem.innerText = data;
  $messageList.appendChild($messageItem);
});

socket.addEventListener("close", () => {
  console.log("서버와 연결이 끊어졌습니다 👋");
});

$messageForm.addEventListener("submit", (e) => submitMessage(e, "message"));
$messageButton.addEventListener("click", (e) => submitMessage(e, "message"));
$nicknameForm.addEventListener("submit", (e) => submitMessage(e, "nickname"));
$nicknameButton.addEventListener("click", (e) => submitMessage(e, "nickname"));

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
  $nicknameInput.value = "";
}
