const tracker = require('./tracker');
const net = require('net');

module.exports = (torrent) =>{
    tracker.getPeers(torrent, (peers)=>{
        console.log(peers);
        // peers.forEach(download);
        console.log('Downloading from .. ');
        console.log(peers[5]);
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