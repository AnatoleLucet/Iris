const ytdl = require('ytdl-core-discord');

const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
});

const ytdlOptions = { quality: 'highestaudio', highWaterMark: 1024 * 1024 * 2 };

const streamOptions = {
  type: 'opus',
  seek: 0,
  volume: 0.85
};

exports.run = async (client, message, args, type, number) => {

  const voiceConnection = await message.member.voice.channel;

  if (!voiceConnection) return message.channel.send('You must be in a voice channel !');

  const permissions = voiceConnection.permissionsFor(message.client.user);

  if (!permissions.has('CONNECT')) return message.reply('I don\'t have permission to join your voice channel.');
  if (!permissions.has('SPEAK')) return message.reply('I don\'t have permission to speak in your voice channel.');


  if (!client.server[message.guild.id]) client.server[message.guild.id] = {
    dispatcher: null,
    songName: null,
    songUrl: null,
    playing: false,
    chooseSong: false,
    chooseSongList: [],
    iPlaylist: 0,
    skip: false,
    playlist: {}
  };


  const getInfos = (song) => {
    youtube.search.list({ part: 'snippet', masResults: '10', q: song, type: 'video' }, (err, data) => {
      if (err) console.error(err) || message.channel.send('No song has been found.');

      if (data) {
        const [youtubeSong] = data.data.items;
        const url = `https://www.youtube.com/watch?v=${youtubeSong.id.videoId}`;
        client.server[message.guild.id].songName = youtubeSong.snippet.title;
        client.server[message.guild.id].songUrl = url;
      }
    });
  };


  const play = () => {
    voiceConnection.join().then(connection => {
      if (client.server[message.guild.id].dispatcher) client.server[message.guild.id].dispatcher.end();

      setTimeout(async () => {
        client.server[message.guild.id].dispatcher = connection.play(await ytdl(client.server[message.guild.id].songUrl, ytdlOptions), streamOptions);
        client.server[message.guild.id].playing = true;
        await message.channel.send(`Now playing \`${client.server[message.guild.id].songName}\``);
      }, 600);
    }).catch(err => console.error(err) && message.channel.send('An error append !'));
  };

  const search = (song) => {
    let list = 'Type the number of the song you want to play :\n';
    youtube.search.list({ part: 'snippet', masResults: '5', q: song, type: 'video' }, (err, data) => {
      if (err) console.error(err) && message.channel.send('An error append.');

      if (data) {
        client.server[message.guild.id].chooseSongList = {};
        let i = 1;
        data.data.items.forEach(video => {
          list += `  ${i++}. \`${video.snippet.title}\`\n`;
          client.server[message.guild.id].chooseSongList.push({ name: video.snippet.title, url: `https://www.youtube.com/watch?v=${video.id.videoId}`});
        });
        message.channel.send(`${list}Cancel in 15 seconds, you can cancel this by typing \`${process.env.CLIENT_PREFIX}cancel\`.`);
      }
      client.server[message.guild.id].chooseSong = true;
      setTimeout(() => client.server[message.guild.id].chooseSong = false, 1000 * 15);
    });
  };


  if (type) {
    console.log(number);
    client.server[message.guild.id].chooseSong = false;
    client.server[message.guild.id].songUrl = client.server[message.guild.id].chooseSongList.url[number - 1];
    client.server[message.guild.id].songName = client.server[message.guild.id].chooseSongList.name[number - 1];

    console.log(client.server[message.guild.id].songUrl, client.server[message.guild.id].songName);
    return play();
  }

  if (args.toString().match(/^https?:\/\/(www.youtube.com|youtube.com)\/watch\?v=(.*)$/)) {
    getInfos(args.toString());
    return play();
  } else if (args.length > 1 && !(/^https?:\/\/(.*)$/).test(args.join(' '))) {
    return search(args.join(' '));
  } else if (args.length === 0) {
    return message.channel.send('You must provide a link or a song name.');
  } else if (args.length === 1 && args.toString().match(/^https?:\/\/(.*)$/)) {
    return message.channel.send('This is not a youtube link.');
  }
  return message.channel.send('It seems like an error append.');
};

exports.aliases = ['p'];
