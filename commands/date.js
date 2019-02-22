exports.run = (client, message) => {
  let date = new Date();
  let ii = date.getMinutes();
  let hh = date.getHours();
  let dd = date.getDate();
  let mm = date.getMonth() + 1;
  let yyyy = date.getFullYear();

  if (ii < 10) {
    ii = '0' + ii;
  } else if (hh < 10) {
    hh = '0' + hh;
  } else if (dd < 10) {
    dd = '0' + dd;
  } else if (mm < 10) {
    mm = '0' + mm;
  }

  date = `${hh}:${ii} \n${dd}/${mm}/${yyyy}`;
  message.channel.send(date);
};
