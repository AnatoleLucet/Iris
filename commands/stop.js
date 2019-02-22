exports.run = (client, message) => {
  console.log('stop');
  if (!message.member.voice.channel) return message.channel.send('You must be in a voice channel !');

  if (!client.server[message.guild.id]) return message.channel.send('No song is currently playing.');

  if (client.server[message.guild.id].dispatcher && client.server[message.guild.id].playing) {
    client.server[message.guild.id].dispatcher.end();
    message.member.voice.channel.leave();
    client.server[message.guild.id].iPlaylist = 0;
    client.server[message.guild.id].playing = false;
  }
};

exports.aliases = ['leave', 'quit', 'q'];
