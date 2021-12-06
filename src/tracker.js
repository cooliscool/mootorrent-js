const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
const crypto = require('crypto');

const torrentParser = require('./torrent-parser');
const util = require('./util');
const logging = require('./log');

const location = 'tracker.js';

module.exports.getPeers = (torrent, callback)=>{

    // Types of Tracker requests : 
    // 1] Connection req
    // 2] Announce req

    const socket = dgram.createSocket('udp4');
    const url  = urlParse(torrent.announce.toString('utf8'));
    
    // TODO: connect and get peers from all trackers in torrent['announce-list'][0]
    // TODO: keep track of when a tracker was pinged last, and ping it again only after delay defined in protocol
    // TODO: keep track of a global peer pool 

    // 1. send connect request
    const connRequest = buildConnReq();
    udpSend(socket, connRequest, url)
    logging.info(location, `sending connection request to tracker `)
    logging.info(location, url)
    logging.info(location, connRequest)

    socket.on('message', response =>{
        // the message from tracker can be either 'connect' response or 'announce' response
        if(respType(response) === 'connect'){
            // 2. receive and parse connection id
            const connResp = parseConnResp(response);
            logging.info(location, 'received connection response from tracker : ');
            logging.info(location, connResp);
            // 3. send announce request 
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
            udpSend(socket, announceReq, url);
            logging.info(location, 'sending announce request to tracker : ')
            logging.info(location, connRequest)
        } else if(respType(response) === 'announce'){
            // 4. parse announce response 
            const announceResp = parseAnnounceResp(response);
            logging.info(location, 'received connection response from tracker : ');
            logging.info(location, announceResp);
            // 5. pass peers to callback
            callback(announceResp.peers);
        }
    });

    socket.on('error', err=>{ console.error(err)})
}

function udpSend(socket, message, rawUrl, callback=()=>{}){
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.hostname, callback);
}

function buildConnReq(){
    const buf = Buffer.alloc(16);

    // magic constant
    buf.writeUInt32BE(0x417, 0);
    buf.writeUInt32BE(0x27101980,4)
    // action 
    buf.writeUInt32BE(0,8);
    // random ID
    crypto.randomBytes(4).copy(buf,12);

    return buf;
}

function buildAnnounceReq(connId, torrent, port=6881){
    const buf = Buffer.alloc(98);

    // connection Id 
    connId.copy(buf,0);
    // action 1=announce
    buf.writeUInt32BE(1, 8);
    // transaction Id -> random Id
    crypto.randomBytes(4).copy(buf,12);
    // info hash
    torrentParser.infoHash(torrent).copy(buf,16);
    // peerId 
    util.genId().copy(buf, 36);
    // downloaded
    Buffer.alloc(8).copy(buf, 56);
    // left
    torrentParser.size(torrent).copy(buf, 64);
    // uploaded
    Buffer.alloc(8).copy(buf,72);
    // event 0-none 1-completed 2-started 3-stopped
    buf.writeInt32BE(0, 80);
    // IP address
    buf.writeUInt32BE(0, 84);
    // key 
    crypto.randomBytes(4).copy(buf,88);
    // num want -1 default
    buf.writeInt32BE(-1, 92);
    // port
    buf.writeUInt16BE(port, 96);

    return buf;
}

function parseConnResp(response){
    return {
        action : response.readUInt32BE(0),
        transactionId: response.readUInt32BE(4),
        connectionId: response.slice(8)
    }
}

function parseAnnounceResp(response){

    function groups(iterable, groupSize) {
        let groups = []
        for (let i =0; i <iterable.length; i+=groupSize){
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }

    return {
        action: response.readUInt32BE(0),
        transactionId: response.readUInt32BE(4),
        interval: response.readUInt32BE(8),
        leechers: response.readUInt32BE(12),
        seeders: response.readUInt32BE(16),
        peers: groups(response.slice(20),6).map( e=> {
            return {
                ip : e.slice(0,4).join('.'),
                port: e.readUInt16BE(4)
            }
        })
    }
}

function respType(response){
    const action = response.readUInt32BE(0);
    if(action === 0) return 'connect';
    if(action === 1) return 'announce';
}