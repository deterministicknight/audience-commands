// display.js


// *******
// Sockets 

var socket = /*global io*/ io();

socket.on('command', function(command) {
  displayCommand(command);
});

socket.on('start', function() {
  startTimer();
});


// *******
// Display 

var performing = false;
var performanceTime = 5 * 60;

var clock = $('.countdown-timer').FlipClock({
  clockFace: 'MinuteCounter',
  autoStart: false,
  countdown: true,
  callbacks: {
    stop: timerFinished
  }
});

$(function() {
  clock.setTime(performanceTime);
});

function start() {
  socket.emit('start');
}

function startTimer() {
  clock.setTime(performanceTime);
  clock.start();
  $('#start-button').hide();
  performing = true;
}

function timerFinished() {
  $('#start-button').show();
  performing = false;
}

function displayCommand(command) {
  if (!performing) {
    return;
  }
  
  $('#command').text(command);
  
  $('#command-container').stop(true, true).animate({ opacity: '1' }, 0);
  $('#command-container').stop(true, true).animate({ opacity: '0' }, 3000);
  
  $('#command').stop(true, true).animate({ backgroundColor: 'rgba(255, 0, 0, 0.6)' }, 0);
  $('#command').stop(true, true).animate({ backgroundColor: 'rgba(255, 0, 0, 0)' }, 1000);
}
