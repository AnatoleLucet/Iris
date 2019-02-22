const Discord = require('discord.js');
const client = new Discord.Client();

const Enmap = require('enmap');

const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
// client.config = require('./config.json');
client.commands = new Enmap();

const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/IrisDb', { useNewUrlParser: true });
client.db = mongoose;

const translation = require('./modules/translation');
client.translation = translation;

client.server = {};


const init = async () => {
  const cmdFiles = await readdir('./commands/');
  console.log(`Loading a total of ${cmdFiles.length} commands.`);

  cmdFiles.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./commands/${file}`);
    let [commandName] = file.split('.');
    console.log(`Loading command: ${commandName}`);
    if (props.aliases) {
      props.aliases.forEach((alias) => {
        client.commands.set(alias, props);
      });
    }
    client.commands.set(commandName, props);
  });

  const evtFiles = await readdir('./events/');
  console.log(`Loading a total of ${evtFiles.length} events.`);

  evtFiles.forEach(file => {
    if (!file.endsWith('.js')) return;
    const event = require(`./events/${file}`);
    let [eventName] = file.split('.');
    console.log(`Loading event: ${eventName}`);
    client.on(eventName, event.bind(null, client));
  });
};
init();

// set client login token
client.login(process.env.CLIENT_TOKEN);
