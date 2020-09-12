const io = require('./server').io;
const logger = require('./config/winston');

const Ev = require('./utils/events');
const socketController = require('./controller/socket-controller');

module.exports = socket => {
  socket.on(Ev.CONNECT, userId => {
    logger.info(`${Ev.CONNECT}: Socket ID => ${socket.id}, User ID => ${userId}`);
    socketController.onUserConnect(socket.id, userId);
  });

  socket.on(Ev.DISCONNECT, () => {
    logger.info(`${Ev.DISCONNECT}: Socket ID => ${socket.id}`);
    socketController.onUserDisconnect(socket.id);
  });

  socket.on(`${Ev.MESSAGE_OUT}`, message => {
    logger.info(`${Ev.MESSAGE_OUT}: Message => ${message.userId} to ${message.recipientId}`);

    socketController.onMessageOut(message).then(({ userMessage, recipientMessage, userChat, recipientChat }) => {
      io.emit(`${Ev.MESSAGE_IN}-${message.userId}`, userChat, userMessage);
      io.emit(`${Ev.MESSAGE_IN}-${message.recipientId}`, recipientChat, recipientMessage);
    });
  });

  socket.on('disconnect', () => {
    logger.info(`disconnect: Socket ID => ${socket.id}`);
    socketController.onUserDisconnect(socket.id);
  });
};
