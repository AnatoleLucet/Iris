exports.run = (client, message) => {
  let color = Math.random() * (0-9999999) + 9999999;
  message.channel.send({
    embed: {
      color: color,
      title: client.translation.help.title._text,
      fields: [
        {
          name: client.translation.help.musicField.title._text,
          value: client.translation.help.musicField.content._text
        },
        {
          name: client.translation.help.playlistField.title._text,
          value: client.translation.help.playlistField.content._text
        },
        {
          name: client.translation.help.othersField.title._text,
          value: client.translation.help.othersField.content._text
        }
      ],
      timestamp: new Date(),
      footer: { text: `© ${client.user.username}` }
    }
  });
};
