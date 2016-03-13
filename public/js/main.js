// main.js

var socket = io();

function handle(command) {
  socket.emit('command', command);
}
