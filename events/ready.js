module.exports = (client) => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${process.env.CLIENT_PREFIX}help`);
};
