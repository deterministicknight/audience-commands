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

var PerformanceModes = Object.freeze({
  "democracy": 1, 
  "anarchy": 2
});

var VotingModes = Object.freeze({
  "time": 1, 
  "count": 2
});

var performing = false;
var performanceTime = 5 * 60;
var performanceMode = PerformanceModes.democracy;
var performanceStartTime = null;
var votingWindow = 4;
var votingWindowCount = 5;
var votingTimer = null;
var votingMode = VotingModes.time;
var currentVoteMap = {};
var currentVoteList = [];
var currentVoteCount = 0;

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
  
  function reset() {
    votingTimer = null;
    currentVoteMap = {};
    currentVoteList = [];
    currentVoteCount = 0;    
  }
  
  if (votingMode == VotingModes.count) {
    // Count-based.
    //
    // If we've hit the voting window count, calculate vote.
    currentVoteMap[command] = (currentVoteMap[command] || 0) + 1;
    currentVoteList.push(command);
    currentVoteCount++;
    
    if (currentVoteCount == votingWindowCount) {
      sendVotedCommand(client);
      reset();
    }
  } else {
    // Time-based.
    //
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
        
        reset();
      }, votingWindow * 1000);
    }
  
    // Then track the vote.
    currentVoteMap[command] = (currentVoteMap[command] || 0) + 1;
    currentVoteList.push(command);
  }
}

function sendVotedCommand(client) {
  var vote = null;
  
  // Determine the vote.
  if (performanceMode == PerformanceModes.democracy) {
    // Democracy voting scheme.
    var votes = [];
    for (var command in currentVoteMap) {
      votes.push([command, currentVoteMap[command]]);
    }
    votes.sort(function(a, b) {
      return b[1] - a[1];
    });
    
    vote = votes[0][0];
  } else {
    // Anarchy voting scheme. Pick random vote.
    vote = currentVoteList[Math.floor(Math.random() * currentVoteList.length)];
  }
  
  // Update the current voting scheme, if needed.
  if (PerformanceModes[vote] !== undefined) {
    performanceMode = vote;
  }
  
  // Send vote to clients.
  if (vote != null) {
    io.emit('command', vote);
  }
}
