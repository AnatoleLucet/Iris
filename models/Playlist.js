const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
  serverID: String,
  playlist: {
    id: Number,
    type: [{
      songUrl: String,
      songName: String
    }]
  }
});

module.exports = mongoose.model('Playlist', playlistSchema);
