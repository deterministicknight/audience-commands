// display.js

var socket = io();

socket.on('command', function(command) {
  var p = document.createElement('p');
  p.innerHTML = command;
  document.body.appendChild(p);
})
