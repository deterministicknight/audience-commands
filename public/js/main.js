// main.js

$(function() {
  $.getJSON('commands.json', function(commands) {
    $.getJSON('images.json', function(images) {
      for (var i in commands) {
        // Create text or image element.
        if ($.inArray(commands[i], images) != -1) {
          $('#buttons')
            .append($('<li>')
              .attr('href', '#/')
              .attr('onclick', 'handle(this);')
              .attr('data-command', commands[i])
              .append($('<img>')
                .attr('src', 'img/' + commands[i] + '.png')));
        } else {
          $('#buttons')
            .append($('<li>')
              .attr('href', '#/')
              .attr('onclick', 'handle(this);')
              .attr('data-command', commands[i])
              .text(commands[i]));
        }
      }
    });
  });
});

var socket = /*global io*/ io();

function handle(element) {
  // Send command back to the server.
  socket.emit('command', element.getAttribute('data-command'));
}
