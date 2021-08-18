const http = require('http');
const socketIO = require('socket.io');
const { ExpressPeerServer } = require("peer");
const { app, PORT } = require('./app');
const server = http.Server(app);

const peerServer = ExpressPeerServer(
  server, 
  { debug: true }
);
app.use("/peerjs", peerServer);
server.listen(PORT, () => console.log(`Server ON (${PORT})`));

const io = socketIO(server);

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