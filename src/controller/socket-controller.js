const { v4: uuidv4 } = require('uuid');
const ChatModel = require('../models/chat');
const MessageModel = require('../models/message');
const UserModel = require('../models/user');
const SocketModel = require('../models/socket');

const onUserConnect = async (socketId, userId) => {
  const socketSearch = await SocketModel.findOne({
    socketId,
    user: userId,
  });

  if (socketSearch) {
    await socketSearch.remove();
  }

  const socketToCreate = await SocketModel.create({
    socketId,
    user: userId,
  });

  await socketToCreate.save();
};

const onUserDisconnect = async (socketId, userId) => {
  const socketToRemove = userId
    ? await SocketModel.findOne({
        socketId,
        user: userId,
      })
    : await SocketModel.findOne({
        socketId,
      });

  if (socketToRemove) {
    await socketToRemove.remove();
  }
};

const onMessageOut = async message => {
  const user = await UserModel.findById(message.userId);
  const recipient = await UserModel.findById(message.recipientId);

  if (!user || !recipient) {
    return;
  }

  const createdMessage = await (
    await MessageModel.create({
      text: message.text,
      date: new Date(),
      user,
    })
  ).save();

  const userChat = await handleChat(createdMessage, user, recipient);
  const recipientChat = await handleChat(createdMessage, recipient, user);

  return { createdMessage, userChat, recipientChat };
};

const getTime = date => {
  return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
};

const handleChat = async (message, user, recipient) => {
  let chat = await ChatModel.findOne({ user, recipient });

  if (!chat) {
    chat = await ChatModel.create({ user, recipient });
  }

  chat.messages.push(message);
  return (await chat.save());
};

module.exports = {
  onUserConnect,
  onUserDisconnect,
  onMessageOut,
};
