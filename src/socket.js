const io = require('./server').io;
const logger = require('./config/winston');

const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  LOGOUT,
  COMMUNITY_CHAT,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE,
  DISCONNECT,
} = require('./utils/events');

const { createUser, createMessage, createChat } = require('./controller/socket-controller');

let connectedUsers = {};
let communityChat = createChat();

module.exports = socket => {
  logger.info(`Socket id: ${socket.id}`);

  let sendMessageToChatFromUser;
  let sendTypingFromUser;

  socket.on(VERIFY_USER, (userId, callback) => {
    if (isUser(connectedUsers, userId)) {
      callback({ isUser: true, user: null });
    } else {
      callback({ isUser: false, user: createUser(userId, socket.id) });
    }
  });

  socket.on(USER_CONNECTED, user => {
    user.socketId = socket.id;
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

    sendMessageToChatFromUser = sendMessageToChat(user.userId);
    sendTypingFromUser = sendTypingToChat(user.userId);

    io.emit(USER_CONNECTED, connectedUsers);
    logger.info(connectedUsers);
  });

  socket.on(DISCONNECT, () => {
    if ('user' in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.userId);

      io.emit(USER_DISCONNECTED, connectedUsers);
      console.log('Disconnect', connectedUsers);
    }
  });

  socket.on(LOGOUT, () => {
    connectedUsers = removeUser(connectedUsers, socket.user.userId);
    io.emit(USER_DISCONNECTED, connectedUsers);
    logger.info('Disconnect, ' + connectedUsers);
  });

  socket.on(COMMUNITY_CHAT, callback => {
    callback(communityChat);
  });

  socket.on(MESSAGE_SENT, ({ chatId, message }) => {
    sendMessageToChatFromUser(chatId, message);
  });

  socket.on(TYPING, ({ chatId, isTyping }) => {
    sendTypingFromUser(chatId, isTyping);
  });

  socket.on(PRIVATE_MESSAGE, ({ reciever, sender }) => {
    if (reciever in connectedUsers) {
      const newChat = createChat({ name: `${reciever}&${sender}`, users: [reciever, sender] });
      const recieverSocket = connectedUsers[reciever].socketId;
      socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
      socket.emit(PRIVATE_MESSAGE, newChat);
    }
  });
};

function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping });
  };
}

function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({ message, sender }));
  };
}

function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  newList[user.userId] = user;
  return newList;
}

function removeUser(userList, userId) {
  let newList = Object.assign({}, userList);
  delete newList[userId];
  return newList;
}

function isUser(userList, userId) {
  return userId in userList;
}
