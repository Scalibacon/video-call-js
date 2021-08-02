const { v4: uuidV4 } = require('uuid');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));

app.get('/', (request, response) => {
  response.redirect(`/${uuidV4()}`);
})

app.get('/:room', (request, response) => {
  response.render('room', { roomId: request.params.room })
})

module.exports = app;