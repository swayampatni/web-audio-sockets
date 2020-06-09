var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.sockets.on('connection', function(socket){

  socket.on('audio-update', function (volume) {
    io.emit('audio-new-value', volume);
  });

  // socket.on('stopped', function() {
  //   socket.broadcast.emit('on-stop');
  // });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
