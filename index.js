'use strict';

const download = require('./src/download');
const torrentParser = require('./src/torrent-parser');

let torrent = null;

if(process.argv[2]){
    torrent = torrentParser.open(process.argv[2]);
}
else{
    console.log('no torrent file specified');
    return;
}

download(torrent);

