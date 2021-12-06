'use strict';

const crypto = require('crypto');
let id = null;

module.exports.genId = () =>{
    // Generate a unique identifier for this torrent client.
    if(!id){
        id = crypto.randomBytes(20);
        Buffer.from('-MT0001-').copy(id, 0);
    }
    return id;
}