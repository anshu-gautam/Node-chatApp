const socket = io();

// Elements
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const sendLocationButton = document.querySelector("#share-Location");
const $messages = document.querySelector("#messages");

// Templates

const messageTemaplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBartemplate = document.querySelector("#sidebar-template").innerHTML;

// option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages conatainer

  const conatainerHeight = $messages.scrollHeight;

  // how far scrolled

  const $scrolloffSet = $messages.scrollTop + visibleHeight;

  if (conatainerHeight - newMessageHeight <= $scrolloffSet) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemaplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });

  messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);

  const html = Mustache.render(locationTemplate, {
    username: message.username,
    mapUrl: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBartemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // disabling send button
  sendButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    // enabling send button

    sendButton.removeAttribute("disabled");

    // clearing Input
    messageInput.value = "";
    messageInput.focus();

    if (error) {
      return console.log(error);
    }
  });
});

sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geo location is not supported by your browser");
  }

  sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (success) => {
        sendLocationButton.removeAttribute("disabled");
        console.log("location shared successfully!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if(error){
  // alert(error);
  console.log(error);
  location.href = "/";
  }
});
