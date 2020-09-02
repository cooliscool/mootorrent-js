'use strict';
const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const bignum = require('bignum');

module.exports.infoHash = (torrent) => {
    // console.log(torrent.info)
    const info = bencode.encode(torrent.info);
    
    return crypto.createHash('sha1').update(info).digest();
};
module.exports.size = (torrent) => {
    const size = torrent.info.files?
    torrent.info.files.map( e=> e.length).reduce((a,b) => a+b ) :
    torrent.info.length
    return bignum.toBuffer(size, {size:8});
};
module.exports.open = (filepath) => {
    return bencode.decode( fs.readFileSync(filepath));
};