// audience-commands


// *******
// Static

// Serve static directory.
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var server = app.listen(process.env.PORT);


// *******
// Sockets 

var io = require('socket.io')(server);

io.on('connection', function(client) {
  console.log(client.id);
  
  // Listen for commands.
  client.on('command', function(command) { 
    console.log("command: " + command);
    
    // Emit command to all displays.
    io.emit('command', command);
  });
  
  client.on('start', function() {
    console.log('starting');
    
    io.emit('start');
  });
});
