const express = require('express'),
  routes = express.Router();
const userController = require('./controller/user-controller');
const chatController = require('./controller/chat-controller');
const passport = require('passport');

routes.post('/register', userController.registerUser);
routes.post('/login', userController.loginUser);

routes.get('/special', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.json({ msg: `Hey ${req.user.email}! I open at the close` });
});

routes.get('/chat', passport.authenticate('jwt', { session: false }), chatController.findAllChats);
routes.get('/chat/:id', passport.authenticate('jwt', { session: false }), chatController.findChatMessages);

module.exports = routes;
