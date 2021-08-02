const http = require('http');
const app = require('./app');
const server = http.Server(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId)
  
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

const PORT = 3000;
server.listen(PORT, () => console.log('Server ON'));