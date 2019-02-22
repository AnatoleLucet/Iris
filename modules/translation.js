const xmlJS = require('xml-js');
const fs = require('fs');

const data = fs.readFileSync( './translation.xml');

let translation = '';

let convert = xmlJS.xml2json(data, {compact: true, spaces: 2});
let parse = JSON.parse(convert).translation;
translation = parse.en;

module.exports = translation;
