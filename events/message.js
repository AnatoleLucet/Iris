const request = require('request');

module.exports = (client, message) => {
  // our standard argument/command name definition.
  const args = message.content.slice(process.env.CLIENT_PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // ignore all bots
  if (message.author.bot) return;

  if (!client.server[message.guild.id]) client.server[message.guild.id] = {
    dispatcher: null,
    songName: null,
    songUrl: null,
    playing: false,
    chooseSong: false,
    chooseSongList: [],
    iPlaylist: 0,
    skip: false,
    playlist: {},
    playlistImport: false,
    playlistImportChannel: null,
    playlistImportObject: {}
  };

  if (client.server[message.guild.id].playlistImport && client.server[message.guild.id].playlistImportChannel === message.channel.id) {
    if (!message.attachments.first()) return;

    if (message.content === `${process.env.CLIENT_PREFIX}cancel`) {
      client.server[message.guild.id].playlistImport = false;
      client.server[message.guild.id].playlistImportChannel = null;
      client.server[message.guild.id].playlistImportObject = {};
      return message.channel.send('Canceled !');
    }

    if (message.attachments.first() && message.attachments.first().name.match(/^(.*)\.json$/)) {
      return request({ url: message.attachments.first().url, json: true }, (err, res, body) => {
        if (err) return console.error(err) && message.channel.send('An error append !');

        let corruptedFile = false;

        if (body === null || !Array.isArray(body) || body.length <= 0) corruptedFile = true;
        else {
          body.forEach((obj) => {
            if (typeof obj !== 'object') return corruptedFile = true;
            if (!obj.songName || obj.songName.length === 0 || typeof obj.songName !== 'string') return corruptedFile = true;
            if (!obj.songUrl || !obj.songUrl.match(/^https?:\/\/(www.youtube.com|youtube.com)\/watch\?v=(.*)$/) || typeof obj.songUrl !== 'string') return corruptedFile = true;
          });
        }

        if (corruptedFile) return message.channel.send('Your file is corrupted.');

        client.server[message.guild.id].playlistImportObject = body;
        return client.commands.get('playlist').run(client, message, args);
      });
    }
    return message.channel.send('This isn\'t a playlist file');
  }

  if (client.server[message.guild.id].chooseSong) {
    if (message.content === `${process.env.CLIENT_PREFIX}cancel`) {
      client.server[message.guild.id].chooseSong = false;
      return message.channel.send('Canceled !');
    }
    if (!(/^\d$/).test(message.content)) return message.channel.send('You must choose a number.');
    let number = Number(message.content);
    if (number < 1 || number > 5) return message.channel.send('You must choose a number between 1 and 5.');
    return client.commands.get('play').run(client, message, args, true, number);
  }

  // ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(process.env.CLIENT_PREFIX) !== 0) return;

  // grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // if that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // some commands may not be useable in DMs. This check prevents those commands from running
  // and return a friendly error message.
  if (cmd && !message.guild && cmd.conf.guildOnly) return;

  // run the command
  cmd.run(client, message, args);
};
