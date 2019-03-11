module.exports = (client) => {
  console.log(`Logged in as ${client.user.tag}!`);

  const activity = () => {
    client.user.setActivity(`${process.env.CLIENT_PREFIX}help`);
  };
  activity();

  setInterval(() => {
    activity();
  }, 1000 * 60 * 60 * 24);
};
