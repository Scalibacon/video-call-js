const { v4: uuidV4 } = require('uuid');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));

app.get('/', (request, response) => {
  return response.render('index');
})

app.get('/room', (request, response) => {
  return response.redirect(`/${uuidV4()}`);
})

app.get('/:roomId', (request, response) => {
  response.render('room', { roomId: request.params.roomId, serverPort: PORT })
})

module.exports = { app, PORT };