// main.js

$(function() {
  $.getJSON('commands.json', function(data) {
    for (var i in data) {
      // Add a clickable element for each command.
      $('#buttons').append('<li><a href="#" onclick="handle(this.innerHTML);">' + data[i] + '</a></li>');
    }
  });
});

var socket = /*global io*/ io();

function handle(command) {
  // Send command back to the server.
  socket.emit('command', command);
}
