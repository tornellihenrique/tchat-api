const logger = require('../config/winston');
const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');
const { ChatConverters, MessageConverters } = require('../utils/converters');

const findAllChats = async (req, res) => {
  try {
    if (!req.user || (req.user && !req.user.id)) {
      return res.status(400).json({ msg: 'You must send User ID' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const chats = await Chat.find({ user }).populate('user').populate('recipient').populate('lastMessage');

    return res.status(200).json((chats || []).map(c => ChatConverters.convertEntityToResponse(c)));
  } catch (e) {
    logger.error(e);
  }
};

const findChatMessages = async (req, res) => {
  try {
    if (!req.user || (req.user && !req.user.id) || !req.params.id) {
      return res.status(400).json({ msg: 'You must send User ID and Recipient ID' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const recipient = await User.findById(req.params.id);

    if (!recipient) {
      return res.status(400).json({ msg: 'Recipient not found' });
    }

    const chat = await Chat.findOne({ user, recipient });

    let messages = [];

    if (!chat) {
      chat = await Chat.create({ user, recipient });
    } else {
      messages = await Message.find({ chat }, {}, { sort: { date: 1 } }).populate('user');
    }

    chat.user = user;
    chat.recipient = recipient;

    return res.status(200).json({
      chat: ChatConverters.convertEntityToResponse(chat),
      messages: (messages || []).map(m => MessageConverters.convertEntityToResponse(m)),
    });
  } catch (e) {
    logger.error(e);
  }
};

module.exports = {
  findAllChats,
  findChatMessages,
};
