const socket = io(); // io 함수가 자동으로 socket.io를 실행하는 서버를 찾음

const $welcome = document.querySelector(".welcome");
const $welcomeForm = document.querySelector(".welcome > form");
const $welcomeInput = document.querySelector(".welcome .welcomeInput");
const $nicknameInput = document.querySelector(".welcome .nicknameInput");
const $room = document.querySelector(".room");
const $roomTitle = document.querySelector(".room > h3");
const $roomForm = document.querySelector(".room > form");
const $roomList = document.querySelector(".room > ul");
const $roomInput = document.querySelector(".room input");

let enteredRoom = "";

$room.hidden = true;

const showRoom = () => {
  $welcome.hidden = true;
  $room.hidden = false;
  $roomTitle.innerText = enteredRoom;
};

const addNewItem = (message) => {
  const li = document.createElement("li");
  li.innerText = message;
  $roomList.appendChild(li);
};

const handleEnterSubmit = (e) => {
  e.preventDefault();
  const payload = {
    roomName: $welcomeInput.value,
    nickname: $nicknameInput.value,
  };

  socket.emit("enterRoom", payload, (roomName) => {
    // 마지막 인자로 백앤드에서 실행시킬 함수를 전달할 수 있음.
    enteredRoom = roomName;
    showRoom();
  }); // 이벤트 이름을 맘대로 짓고, payload를 다양한 타입으로 보낼 수 있음.
  $welcomeInput.value = "";
};

const handleMessageSubmit = (e) => {
  e.preventDefault();

  const payload = { message: $roomInput.value, roomName: enteredRoom };
  socket.emit("newMessage", payload, (message) => {
    addNewItem(`You: ${message}`);
    $roomInput.value = "";
  });
};

socket.on("welcome", (nickname) => {
  alert(`${nickname}이(가) 입장하셨습니다 🌈`);
});

socket.on("newMessage", addNewItem);

socket.on("roomChange", (rooms) => {
  const $roomList = $welcome.querySelector("ul");
  $roomList.innerHTML = "";

  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    $roomList.append(li);
  });
});

$welcomeForm.addEventListener("submit", handleEnterSubmit);
$roomForm.addEventListener("submit", handleMessageSubmit);
