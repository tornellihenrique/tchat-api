const mongoose = require('mongoose');

const SocketSchema = new mongoose.Schema({
  socketId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

module.exports = mongoose.model('Socket', SocketSchema);
