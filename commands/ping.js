exports.run = async (client, message) => {
  const m = await message.channel.send('Ping?');
  m.edit(`${client.translation.ping.title._text}\n${client.translation.ping.pingText._text} : \`${Math.round(client.ws.ping)}ms\`.\n${client.translation.ping.latency._text} : \`${m.createdTimestamp - message.createdTimestamp}ms\`.`);
};
