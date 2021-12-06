const location = 'download.js'
const tracker = require('./tracker');
const net = require('net');
const logging = require('./log');

module.exports = (torrent) =>{
    tracker.getPeers(torrent, (peers)=>{
        logging.info(location, 'list of peers from tracker');
        logging.info(location, peers);
        // TODO: download from multiple 
        logging.info(`connecting to peer : ${peers[5]}`);
        download(peers[5]);
    })
}

function download(peer){
    const socket = new net.Socket();
    
    socket.on('error', console.error);
    socket.connect(peer.port, peer.ip, ()=>{
        socket.write(Buffer.from('Hello world!'));
    });
    socket.on('data', responseBuffer =>{
        console.log(responseBuffer);
    });
}