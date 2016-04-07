// display.js


// *******
// Sockets 

var socket = /*global io*/ io();

socket.on('command', function(command) {
  displayCommand(command);
});

socket.on('command-raw', function(command) {
  displayRawCommand(command);
});

socket.on('start', function(time) {
  startPerformance(time);
});

socket.on('end', function() {
  endPerformance();
});


// *******
// Display 

var supportedImages = null;

var clock = $('.countdown-timer').FlipClock({
  clockFace: 'MinuteCounter',
  autoStart: false,
  countdown: true
});

$(function() {
  $.getJSON('images.json', function(data) {
    supportedImages = data;
  });
  
  clock.setTime(0);
});

function start() {
  socket.emit('start');
}

function startPerformance(time) {
  console.log('start: ' + time);
  
  clock.setTime(time);
  clock.start();
  $('#start-button').hide();
}

function endPerformance() {
  clock.reset();
  $('#start-button').show();
  $('#phrase-image').attr('src', '');
}

function displayCommand(command) {
  // If the command is an image for a phrase, update our current image.
  if ($.inArray(command, supportedImages) != -1) {
    $('#phrase-image').attr('src', 'img/' + command + '.png');
  }
  
  displayText(command);
}

function displayRawCommand(command) {
  var item = $('<li>').attr('class', 'ticker-item').append(command);
  $('#ticker-list').prepend(item);
  
  // TODO: find a way animate a slide on all items.
  item.delay(500).fadeOut(300, function(){
    item.remove();
  });
}

function displayText(text) {
  $('#command').text(text);
  
  $('#command-container').stop(true, true).animate({ opacity: '1' }, 0);
  $('#command-container').stop(true, true).animate({ opacity: '0' }, 3000);
  
  $('#command').stop(true, true).animate({ backgroundColor: 'rgba(255, 0, 0, 0.6)' }, 0);
  $('#command').stop(true, true).animate({ backgroundColor: 'rgba(255, 0, 0, 0)' }, 1000);
}
