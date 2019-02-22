exports.run = (client, message) => {
  let color = Math.random() * (0-9999999) + 9999999;
  message.channel.send({
    embed: {
      color: color,
      author: {
        name: message.member.user.username,
        icon_url: message.member.user.avatarURL
      },
      fields: [{
        name: client.translation.help.title._text,
        value: client.translation.help.content._text
      }],
      timestamp: new Date(),
      footer: { text: `© ${client.user.username}` }
    }
  });
};
