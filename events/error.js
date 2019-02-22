module.exports = (client, message) => {
  if (message.author.bot) return;

  client.users.get('270228606767202316').send('!!!! AN ERROR APPEND !!!!');
  if (message.content.startsWith(process.env.CLIENT_PREFIX)) return message.channel.send('We\'re sorry but the bot seems to have a probleme !');
};
