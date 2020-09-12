const chat = require('../models/chat');

const UserConverters = {
  convertEntityToResponse: (user, withPassword = false) => {
    if (!user) {
      return null;
    }

    if (!user.id) {
      return user;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: withPassword ? user.password : undefined,
    };
  },
};

const ChatConverters = {
  convertEntityToResponse: chat => {
    if (!chat) {
      return null;
    }

    if (!chat.id) {
      return chat;
    }

    return {
      id: chat.id,
      user: UserConverters.convertEntityToResponse(chat.user),
      recipient: UserConverters.convertEntityToResponse(chat.recipient),
      lastMessage: MessageConverters.convertEntityToResponse(chat.lastMessage),
    };
  },
};

const MessageConverters = {
  convertEntityToResponse: (message, withChat = false) => {
    if (!message) {
      return null;
    }

    if (!message.id) {
      return message;
    }

    return {
      id: message.id,
      user: UserConverters.convertEntityToResponse(message.user),
      text: message.text,
      date: message.date,
      chat: withChat ? ChatConverters.convertEntityToResponse(message.chat) : undefined,
    };
  },
};

module.exports = {
  UserConverters,
  ChatConverters,
  MessageConverters,
};
