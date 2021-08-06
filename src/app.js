const { v4: uuidV4 } = require('uuid');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));

app.get('/', (request, response) => {
  return response.render('index');
})

app.get('/room', (request, response) => {
  // return response.redirect(`/${uuidV4()}`);
  return response.redirect(`/${1}`);
})

app.get('/:roomId', (request, response) => {
  response.render('room', { roomId: request.params.roomId })
})

module.exports = app;