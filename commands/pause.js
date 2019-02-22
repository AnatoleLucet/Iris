exports.run = (client, message) => {
  if (!client.server[message.guild.id]) return message.channel.send('No song is currently playing.');
  else if (!message.member.voice.channel) return message.channel.send('You need to be connected in a voice channel.');
  else if (client.server[message.guild.id].dispatcher.paused) return message.channel.send('The song is already in pause.');
  else if (!client.server[message.guild.id].dispatcher.paused) return client.server[message.guild.id].dispatcher.pause() && message.channel.send('The song as been paused.');
  message.channel.send('An error append !');
};

exports.aliases = ['pa', 'ps'];
