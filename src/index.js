const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const FilterWords = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messgeTime");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("socket connection is active");

  socket.on("join", ({username, room}, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error)
    }
    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));

    socket.broadcast.to(user.room).emit("message",generateMessage("Admin", `${user.username} has joined!`)
      );

    socket.to(user.room).emit("roomData", {room: user.room, users: getUserInRoom(user.room),
    });

    callback()
  });

  socket.on("sendMessage", (messageRec, callback) => {
    const user = getUser(socket.id);

    const filter = new FilterWords();
    if (filter.isProfane(messageRec)) {
      return callback("Profanity is not Allowd!");
    }

    io.to(user.room).emit(
      "message",
      generateMessage(user.username, messageRec)
    );
    callback();
  });

  socket.on("sendLocation", (coords, success) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    success();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message",generateMessage("Admin", `${user.username} has left!`)
      );
      socket.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
