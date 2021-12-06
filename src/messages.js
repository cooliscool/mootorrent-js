'use strict';

// TODO : write flow 
// TODO : code all different types of requests & responses 
const location = 'messages.js'
const Buffer = require('buffer').Buffer;
const torrentParser = require('./torrent-parser');
const util = require('./util');
const { builtinModules } = require('module');

// 

module.exports.buildHandshake = (torrent)=> {
    // handshake: 
    // <pstrlen><pstr><reserved><info_hash><peer_id>
    // pstrlen -> single raw byte, length of pstr
    // pstr -> string identifier of protocol
    // reserved -> for addon features, usually left zero
    // info_hash -> infoHash() in torrent-parser
    // peer_id -> 20 byte string, unique ID for client - genId() in util

    const buf = Buffer.alloc(68);
    // pstrlen
    buf.writeUInt8(19, 0);
    // pstr
    buf.write('BitTorrent protocol', 1); // writes to the end of buffer
    // reserved
    buf.writeUInt32BE(0,20);
    buf.writeUInt32BE(0,24);
    // info hash
    torrentParser.infoHash(torrent).copy(buf,28);
    // peer id
    buf.write(util.genId());
    return buf;  
}

module.exports.buildKeepAlive = ()=> Buffer.alloc(4);

module.exports.buildChoke = ()=> {
    // message type 0
    const buf = Buffer.alloc(5);
    // length 
    buf.writeUInt32BE(1,0);
    // message id
    buf.writeUInt8(0,4);
    return buf;
}

module.exports.buildUnchoke = ()=> {
    // message type 1
    const buf = Buffer.alloc(5);
    // length 
    buf.writeUInt32BE(1,0);
    // message id
    buf.writeUInt8(1,4);
    return buf;
}

module.exports.buildInterested = ()=> {
    // message type 2
    const buf = Buffer.alloc(5);
    // length 
    buf.writeUInt32BE(1,0);
    // message id
    buf.writeUInt8(2,4);
    return buf;
}

module.exports.buildUninterested = ()=> {
    // message type 3
    const buf = Buffer.alloc(5);
    // length 
    buf.writeUInt32BE(1,0);
    // message id
    buf.writeUInt8(3,4);
    return buf;
}

module.exports.buildHave = (payload)=> {
    // message type 4
    const buf = Buffer.alloc(9);
    // length 
    buf.writeUInt32BE(5,0);
    // message id
    buf.writeUInt8(4,4);
    // payload
    buf.writeUInt32BE(payload, 5);
    return buf;
}

module.exports.buildBitField = (bitfield)=> {
    // message type 5
    const buf = Buffer.alloc(bitfield.length + 1 + 4);
    // length 
    buf.writeUInt32BE(bitfield.length + 1,0);
    // message id
    buf.writeUInt8(5,4);
    // payload
    bitfield.copy(buf,5);
    return buf;
}

module.exports.buildRequest = (payload)=> {
    // message type 6
    const buf = Buffer.alloc(17);
    // length 
    buf.writeUInt32BE(13,0);
    // message id
    buf.writeUInt8(6,4);
    // payload
    // index - zero based piece index
    buf.writeUInt32BE(payload.index, 5);
    // begin - zero based byte offset within the piece 
    buf.writeUInt32BE(payload.begin, 9);
    // length - integer specifying requested length
    buf.writeUInt32BE(payload.length, 13);
    return buf;
    
}

module.exports.buildPiece = (payload)=> {
    // message type 7
    const buf = Buffer.alloc(payload.block.length + 8 + 1 + 4);
    // length 
    buf.writeUInt32BE(payload.block.length + 9,0);
    // message id
    buf.writeUInt8(7,4);
    // payload
    // index 
    buf.writeUInt32BE(payload.index,5);
    // begin    
    buf.writeUInt32BE(payload.begin,9);
    // block
    payload.block.copy(buf,13);
    return buf;
}

module.exports.buildCancel = (payload)=> {
    // message type 8
    const buf = Buffer.alloc(12 + 1 + 4);
    // length 
    buf.writeUInt32BE(13,0);
    // message id
    buf.writeUInt8(8,4);
    // payload
    // index - zero based piece index
    buf.writeUInt32BE(payload.index, 5);
    // begin - zero based byte offset within the piece 
    buf.writeUInt32BE(payload.begin, 9);
    // length - integer specifying requested length
    buf.writeUInt32BE(payload.length, 13);
    return buf;
}

module.exports.buildPort = (port)=> {
    // message type 9
    const buf = Buffer.alloc(2 + 1 + 4 );
    // length 
    buf.writeUInt32BE(3,0);
    // message id
    buf.writeUInt8(9,4);
    // payload - listen-port for DHT
    buf.writeUInt16BE(port, 5);
    return buf;
}

// console.log(this.buildRequest(
//     {
//         index:123,
//         begin:0,
//         length:101
//     }
// ))

// console.log(this.buildPiece(
//     {
//         index: 123,
//         begin: 0,
//         block: new Buffer("hello howdy!")
//     }
// ));