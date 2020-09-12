const { v4: uuidv4 } = require('uuid');
const logger = require('../config/winston');
const ChatModel = require('../models/chat');
const MessageModel = require('../models/message');
const UserModel = require('../models/user');
const SocketModel = require('../models/socket');
const { UserConverters, ChatConverters, MessageConverters } = require('../utils/converters');

const onUserConnect = async (socketId, userId) => {
  try {
    const socketSearch = await SocketModel.findOne({
      socketId,
      user: userId,
    });

    if (socketSearch) {
      await socketSearch.remove();
    }

    await SocketModel.create({
      socketId,
      user: userId,
    });
  } catch (e) {
    logger.error(e);
  }
};

const onUserDisconnect = async (socketId, userId) => {
  try {
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
  } catch (e) {
    logger.error(e);
  }
};

const onMessageOut = async message => {
  try {
    let user = await UserModel.findById(message.userId);
    let recipient = await UserModel.findById(message.recipientId);

    if (!user || !recipient) {
      return;
    }

    const { chat: userChat, createdMessage: userMessage } = await handleChat(message, user, user, recipient);
    const { chat: recipientChat, createdMessage: recipientMessage } = await handleChat(message, user, recipient, user);

    return {
      userMessage: MessageConverters.convertEntityToResponse(userMessage),
      recipientMessage: MessageConverters.convertEntityToResponse(recipientMessage),
      userChat: ChatConverters.convertEntityToResponse(userChat),
      recipientChat: ChatConverters.convertEntityToResponse(recipientChat),
    };
  } catch (e) {
    logger.error(e);
  }
};

const getTime = date => {
  return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
};

const handleChat = async (message, owner, user, recipient) => {
  let chat = await ChatModel.findOne({ user, recipient });

  if (!chat) {
    chat = await ChatModel.create({ user, recipient });
  }

  const createdMessage = await MessageModel.create({
    text: message.text,
    date: new Date(),
    user: owner,
    chat,
  });

  chat.lastMessage = createdMessage;
  await chat.save();

  chat.user = user;
  chat.recipient = recipient;
  createdMessage.user = owner;

  return { chat, createdMessage };
};

module.exports = {
  onUserConnect,
  onUserDisconnect,
  onMessageOut,
};
