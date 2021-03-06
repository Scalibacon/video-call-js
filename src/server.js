const socketIO = require('socket.io');
const { PeerServer } = require('peer');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server ON (PORT ${PORT})`));
const io = socketIO(server);

PeerServer({ port: 3001, path: '/' });

let rooms = {};

io.on('connection', socket => {
  socket.on('join-room', (roomId, peerId) => {

    socket.join(roomId);
    
    putPeerInTheRoom(roomId, socket.id, peerId);    

    socket.broadcast.to(roomId).emit('peer-connected', peerId)

    socket.emit('connect-with-old-peers', rooms[roomId].peers);
  
    socket.on('disconnect', () => {
      removePeerFromRoom(socket.id);           

      socket.broadcast.to(roomId).emit('peer-disconnected', peerId)
    })

    socket.on('mute', () => {
      io.in(roomId).emit('peer-mute', peerId) // emite pro sender também
      // socket.broadcast.to(roomId).emit('peer-mute', peerId) //geral menos sender
    })

    socket.on('unmute', () => {
      io.in(roomId).emit('peer-unmute', peerId)
    })

    socket.on('close-camera', () => {
      io.in(roomId).emit('peer-close-camera', peerId)
    })

    socket.on('open-camera', () => {
      io.in(roomId).emit('peer-open-camera', peerId)
    })
  })
})

function putPeerInTheRoom(roomId, socketId, peerId){
  if(!rooms[roomId]) {
    rooms[roomId] = {
      peers: {}
    };
  }
  
  rooms[roomId].peers[socketId] = {
    peerId: peerId,
    isMuted: false,
    isCameraOff: false
  };
}

function removePeerFromRoom(socketId){
  try{
    for(let roomId in rooms){
      const room = rooms[roomId];
      if(!room.peers[socketId]){
        continue;
      }
      delete room.peers[socketId];
      break;
    } 
  } catch (error){
    console.log('Error trying to find peer to remove: ' + error);
  }
}