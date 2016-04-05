// display.js


// *******
// Sockets 

var socket = /*global io*/ io();

socket.on('command', function(command) {
  displayCommand(command);
});

socket.on('start', function(time) {
  startPerformance(time);
});

socket.on('end', function() {
  endPerformance();
});


// *******
// Display 


var clock = $('.countdown-timer').FlipClock({
  clockFace: 'MinuteCounter',
  autoStart: false,
  countdown: true
});

$(function() {
  clock.setTime(0);
});

function start() {
  socket.emit('start');
}

function startPerformance(time) {
  clock.setTime(time);
  clock.start();
  $('#start-button').hide();
}

function endPerformance() {
  $('#start-button').show();
}

function displayCommand(command) {
  $('#command').text(command);
  
  $('#command-container').stop(true, true).animate({ opacity: '1' }, 0);
  $('#command-container').stop(true, true).animate({ opacity: '0' }, 3000);
  
  $('#command').stop(true, true).animate({ backgroundColor: 'rgba(255, 0, 0, 0.6)' }, 0);
  $('#command').stop(true, true).animate({ backgroundColor: 'rgba(255, 0, 0, 0)' }, 1000);
}
