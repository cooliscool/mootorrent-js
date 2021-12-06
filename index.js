'use strict';
const location = 'index.js'

const download = require('./src/download');
const torrentParser = require('./src/torrent-parser');
const logging = require('./src/log');

let torrent = null;

if(process.argv[2]){
    torrent = torrentParser.open(process.argv[2]);
    logging.info(location, 'torrent file parsed : ');
    logging.info(location, torrent);
}
else{
    logging.error(location, 'no torrent file specified');
    return;
}

download(torrent);

