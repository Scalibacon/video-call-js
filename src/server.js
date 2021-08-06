const http = require('http');
const app = require('./app');
const server = http.Server(app);
const io = require('socket.io')(server);
let rooms = [];

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {

    socket.join(roomId);
    
    if(!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = userId;

    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.emit('connect-with-old-users', rooms[roomId]);
  
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

      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

const PORT = 3000;
server.listen(PORT, () => console.log('Server ON'));