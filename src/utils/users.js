// creating array of users
const users = [];

// add user function
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validating users
  if (!username || !room) {
    return {
      error: "Username and Room must specified!",
    };
  }

  // checking Users
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: " Name already in use !",
    }
  }

  // storing User

  const user = { id, username, room };
  users.push(user)
  return { user }
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUserInRoom = (room)=>{
  return users.filter((user) => user.room === room);
  // sorthand of return user.room === room used above
}


module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
}