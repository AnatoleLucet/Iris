const Playlist = require('../models/Playlist');

const jsonfile = require('jsonfile');
const fs = require('fs');

const ytdl = require('ytdl-core-discord');

const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
});

const ytdlOptions = { quality: 'highestaudio', highWaterMark: 1024 * 1024 * 2 };

const streamOptions = {
  type: 'opus',
  seek: 0,
  volume: 0.85
};

exports.run = async (client, message, args) => {
  if (client.server[message.guild.id].playlistImport) {
    console.log('importing');

    return Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);

      if (!foundObject) {
        console.log('new playlist');
        const newPlaylist = new Playlist({
          serverID: message.guild.id,
          playlist: client.server[message.guild.id].playlistImportObject
        });
        newPlaylist.save().catch(console.error);
      } else if (foundObject.playlist && foundObject.playlist !== null && client.server[message.guild.id].playlistImportObject.length > 0) {
        console.log('pushing');
        client.server[message.guild.id].playlistImportObject.forEach((obj) => {
          foundObject.updateOne({ $push: { playlist: obj } }).catch(console.error);
        });
      } else {
        console.log('error');
        return message.channel.send('An error append !');
      }
      client.server[message.guild.id].playlistImport = false;
      client.server[message.guild.id].playlistImportChannel = null;
      client.server[message.guild.id].playlistImportObject = {};
      return message.channel.send('Your playlist has been imported !');
    });
  }

  const voiceConnection = await message.member.voice.channel;

  const play = (playlist) => {
    const permissions = voiceConnection.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return message.reply('I don\'t have permission to join your voice channel.');
    if (!permissions.has('SPEAK')) return message.reply('I don\'t have permission to speak in your voice channel.');

    voiceConnection.join().then(connection => {
      if (client.server[message.guild.id].dispatcher) client.server[message.guild.id].dispatcher.end();

      setTimeout(async () => {
        client.server[message.guild.id].dispatcher = connection.play(await ytdl(client.server[message.guild.id].songUrl, ytdlOptions), streamOptions);
        client.server[message.guild.id].playing = true;
        message.channel.send(`Now playing \`${client.server[message.guild.id].songName}\``);

        if (playlist) {
          client.server[message.guild.id].dispatcher.once('end', () => {
            Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
              if(err) console.error(err);
              if (!foundObject) return message.channel.send('No playlist found !');
              if (client.server[message.guild.id].playing && client.server[message.guild.id].playlist !== {}) return playNextSong(client.server[message.guild.id].playlist);
            });
          });
        }
      }, 600);
    }).catch(err => console.error(err) && message.channel.send('An error append !'));
  };

  const playNextSong = (foundObject) => {
    if (client.server[message.guild.id].iPlaylist >= foundObject.length || client.server[message.guild.id].iPlaylist < 0) {
      client.server[message.guild.id].dispatcher.end();
      client.server[message.guild.id].iPlaylist = 0;
      client.server[message.guild.id].playlist = {};
      client.server[message.guild.id].playing = false;
      return message.channel.send('Your playlist run out of songs.');
    }
    client.server[message.guild.id].songUrl = foundObject[client.server[message.guild.id].iPlaylist].songUrl;
    client.server[message.guild.id].songName = foundObject[client.server[message.guild.id].iPlaylist].songName;
    client.server[message.guild.id].iPlaylist++;
    return play(true);
  };

  const shuffleArray = (a) => {
    var i, j, x;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  };

  // play the playlist
  if (args[0] === 'play' || args[0] === 'p') {
    console.log('play');

    if (!voiceConnection) return message.channel.send('You must be in a voice channel !');

    Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);
      if (!foundObject) {
        message.channel.send('No playlist found !');
      } else {
        if (client.server[message.guild.id].playing) return message.channel.send('I\'m already playing.');
        client.server[message.guild.id].playlist = foundObject.playlist;
        playNextSong(client.server[message.guild.id].playlist);
      }
    });

    // play by random
  } else if (args[0] === 'random' || args[0] === 'r') {
    console.log('random');

    if (!voiceConnection) return message.channel.send('You must be in a voice channel !');

    Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);
      if (!foundObject) {
        message.channel.send('No playlist found !');
      } else {
        if (client.server[message.guild.id].playing) return message.channel.send('I\'m already playing.');
        client.server[message.guild.id].playlist = shuffleArray(foundObject.playlist);
        playNextSong(client.server[message.guild.id].playlist);
      }
    });

    // play by number
  } else if (!isNaN(args[0])) {
    console.log('by number');

    if (!voiceConnection) return message.channel.send('You must be in a voice channel !');

    if (!client.server[message.guild.id]) client.server[message.guild.id] = { dispatcher: null, songName: null, songUrl: null, playing: false, chooseSong: false, chooseSongList: [] };

    Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);

      if (!foundObject) {
        message.channel.send('No playlist found !');
      } else {
        if (Number(args) > foundObject.playlist.length || Number(args) < 1) return message.channel.send('This Song is not in the playlist.');
        client.server[message.guild.id].songUrl = foundObject.playlist[Number(args) - 1].songUrl;
        client.server[message.guild.id].songName = foundObject.playlist[Number(args) - 1].songName;
        play();
      }

      // music.play(client, message, foundObject.playlist[args-1]);
    });

    // skip
  } else if (args[0] === 'skip') {
    console.log('skip');

    if (!message.member.voice.channel) return message.channel.send('You must be in a voice channel !');

    if (!client.server[message.guild.id] || !client.server[message.guild.id].dispatcher && !client.server[message.guild.id].playing) return message.channel.send('No song is currently playing.');

    Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);

      if (!foundObject) {
        message.channel.send('No playlist found !');
      } else {
        client.server[message.guild.id].dispatcher.end();
      }
    });

    // add a song to the playlist
  } else if (args[0] === 'add') {
    console.log('add');
    let song = args.slice(1).join(' ');
    let url = 'url';

    youtube.search.list({ part: 'snippet', masResults: '10', q: song, type: 'video' }, (err, data) => {
      if (err) console.error(err) || message.channel.send('An error append.');

      if (data) {
        const [youtubeSong] = data.data.items;
        url = `https://www.youtube.com/watch?v=${youtubeSong.id.videoId}`;
        song = youtubeSong.snippet.title;

        Playlist.findOne({ serverID: message.guild.id }, async (err, foundObject) => {
          if(err) console.error(err);

          if (!foundObject || foundObject.playlist === null) {
            const newPlaylist = await new Playlist({
              serverID: message.guild.id,
              playlist: {
                songUrl: url,
                songName: song
              }
            });
            newPlaylist.save().catch(console.error);
          } else {
            foundObject.updateOne({ $push: { playlist: { songUrl: url, songName: song } } }, (err) => {
              if(err) console.error(err);
            });
          }
        });

        message.reply(`I've added \`${song}\` to the playlist !`);
      }
    });


    // return a list of the playlist
  } else if (args[0] === 'list') {
    console.log('list');
    Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);
      console.log(foundObject);
      if (!foundObject || foundObject.playlist === null || foundObject.playlist.length <= 0) return message.channel.send('No playlist found !');

      let playlistList = () => {
        let result = 'Your playlist :\n';
        let i = 1;

        foundObject.playlist.forEach(song => {
          result += `${i++} : \`${song.songName}\`\n`;
        });

        return result;
      };
      message.channel.send(playlistList());

    });

    // remove a song from the playlist
  } else if (args[0] === 'remove') {
    console.log('remove');
    return Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);

      if (!foundObject) {
        message.channel.send('No playlist found !');
      } else {
        if (args.slice(1) > foundObject.playlist.length || args.slice(1) < 1) return message.channel.send('This song is not in the playlist.');
        if (args.length > 2) {
          let finalMessage = 'I\'ve just removed :',
            i = 1;

          args.slice(1).forEach((nbr) => {
            foundObject.updateOne({ $pull: { playlist: foundObject.playlist[nbr - 1] } }, { multi: false }, err => console.error(err));
            finalMessage += `\n${i++}. \`${foundObject.playlist[nbr - 1].songName}\``;
          });

          return message.channel.send(finalMessage);
        }
        foundObject.updateOne({ $pull: { playlist: foundObject.playlist[args.slice(1) - 1] } }, { multi: false }, err => console.error(err));
        return message.channel.send(`I've just removed \`${foundObject.playlist[args.slice(1) - 1].songName}\`.`);
      }
    });

    // remove everything in the playlist
  } else if (args[0] === 'clear') {
    console.log('clear');
    Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);

      if (!foundObject) {
        message.channel.send('No playlist found');
      } else {
        foundObject.remove(0);
        message.channel.send('Playlist has been clear.');
      }
    });

    // export playlist
  } else if (args[0] === 'export') {
    return Playlist.findOne({ serverID: message.guild.id }, (err, foundObject) => {
      if(err) console.error(err);

      if (!foundObject) {
        message.channel.send('No playlist found');
      } else {
        // let json = JSON.stringify(foundObject.playlist, null, '\t');
        jsonfile.writeFile(`/tmp/iris/exports/playlist-${message.guild.id}.json`, foundObject.playlist, (err) => {
          if (err) return console.error(err) && message.channel.send('An error append !');
          return message.channel.send('Your playlist\'s save file :', { files: [`/tmp/iris/exports/playlist-${message.guild.id}.json`] }).then(() => {
            fs.unlink(`/tmp/iris/exports/playlist-${message.guild.id}.json`, console.error);
          });
        });
      }
    });

  } else if (args[0] === 'import') {
    client.server[message.guild.id].playlistImport = true;
    client.server[message.guild.id].playlistImportChannel = message.channel.id;
    message.channel.send(`You have 15 seconds for importing the file in this channel. You can cancel this by typing \`${process.env.CLIENT_PREFIX}cancel\`.`);
    setTimeout(() => {
      client.server[message.guild.id].playlistImport = false;
      client.server[message.guild.id].playlistImportChannel = null;
    }, 1000 * 15);

    // wrong command
  } else if (args.length === 0) {
    message.channel.send(`This is not a command, type \`${process.env.CLIENT_PREFIX}help\` to see every commands.`);
  } else {
    message.channel.send('An error append !');
  }
};


exports.aliases = ['pl'];
