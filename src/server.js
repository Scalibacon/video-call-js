const http = require('http');
const app = require('./app');
const server = http.Server(app);
const io = require('socket.io')(server);
let rooms = [];

io.on('connection', socket => {
  socket.on('join-room', (roomId, peerId) => {

    socket.join(roomId);
    
    if(!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = peerId;

    socket.broadcast.to(roomId).emit('peer-connected', peerId)

    socket.emit('connect-with-old-peers', rooms[roomId]);
  
    socket.on('disconnect', () => {
      // remove o id do usuário da sala
      for(let roomId in rooms){
        const room = rooms[roomId];
        if(!room[socket.id]){
          continue;
        }
        delete room[socket.id];
        break;
      }      

      socket.broadcast.to(roomId).emit('peer-disconnected', peerId)
    })
  })
})

const PORT = 3000;
server.listen(PORT, () => console.log('Server ON'));