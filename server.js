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
  
  handleConnect(client);
  
  client.on('command', function(command) { 
    handleCommand(client, command);
  });
  
  client.on('start', function() {
    startPerformance(client);
  });
});


// *******
// Performance

var performing = false;
var performanceTime = 5 * 60;
var performanceStartTime = null;
var votingWindow = 4;
var votingTimer = null;
var currentVotingCountMap = {};

function startPerformance(client) {
  if (performing) {
    return;
  }
    
  performing = true;
  performanceStartTime = new Date();
  io.emit('start', performanceTime);
    
  // Inform all clients that the performance has ended after
  // the set performance time.
  setTimeout(endPerformance, performanceTime * 1000);
}

function endPerformance() {
  performing = false;
  io.emit('end');
}

function handleConnect(client) {
  if (!performing) {
    return;
  }
  
  var timeElapsed = (new Date() - performanceStartTime) / 1000;
  var timeRemaining = performanceTime - timeElapsed;
  client.emit('start', timeRemaining);
}

function handleCommand(client, command) {
  if (!performing) {
    return;
  }
  
  io.emit('command-raw', command);
  
  // To handle voting, we keep track of the number of votes
  // each command receives within a single window. When the
  // window passes, we send the command that had the most
  // votes, or a random value if all have the same amount
  // of votes.
  //
  // First set up the voting window.
  if (votingTimer == null) {
    votingTimer = setTimeout(function() {
      sendVotedCommand(client);
      
      votingTimer = null;
      currentVotingCountMap = {};
    }, votingWindow * 1000);
  }
  
  // Then track the vote.
  currentVotingCountMap[command] = (currentVotingCountMap[command] || 0) + 1;
}

function sendVotedCommand(client) {
  // Determine the vote.
  var votes = [];
  for (var command in currentVotingCountMap) {
    votes.push([command, currentVotingCountMap[command]]);
  }
  votes.sort(function(a, b) {
    return b[1] - a[1];
  });
  
  if (votes.length > 0) {
    io.emit('command', votes[0][0]);
  }
  
  console.log(votes);
}
