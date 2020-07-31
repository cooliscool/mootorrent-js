'use strict';
const fs = require('fs');
const bencode = require('bencode');

const tracker = require('./tracker');
const torrentParser = require('./torrent-parser');

const torrent = torrentParser.open('./hellhigh.torrent');

tracker.getPeers(torrent, (peers)=>{
    console.log(peers);
})

