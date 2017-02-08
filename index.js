var express = require('express');
var path = require('path');
var app = express();


var http = require('http').Server(app);
var io = require('socket.io')(http);

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.render('index.html');
});

var router = express.Router();

var playerUniqueId=1;

var gameApp = {
    inProgress: false,
    startGameCounterCounting: false,
    startGameCounterDuration: 3000,
    startGameCounterTimeout: false,
    tilesAmount: 3,
    moveAmount: 1,
    players: [],
    readyPlayers: [],
    inGamePlayers: [],
    spectatePlayers: [],
    playerTurn: 0,
    // gridTiles: [[1,1,0],[1,2,1],[2,1,1],[2,2,0]],
    gridTiles: [],
    startGameCounter: function(){
        clearTimeout(this.startGameCounterTimeout);
        this.startGameCounterTimeout = setTimeout(this.startGameCounterFinish, this.startGameCounterDuration);
    },
    startGameCounterFinish: function(){
        gameApp.inProgress = true;
        gameApp.startGameCounterCounting = false;
        clearTimeout(this.startGameCounterTimeout);
        gameApp.players.forEach(function(player, index){
            if(player.ready){
                player.ready = false;
                player.inGame = true;
                gameApp.inGamePlayers.push(player);
            }
        });
        io.emit('startGame', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
    },
    startGameCounterStop: function(){
        clearTimeout(this.startGameCounterTimeout);
        io.emit('startGameCounterStop', gameApp.players);
    },
    checkForVictory: function(){
        playerCheck = [
            [
                [[],[],[]],
                [[],[],[]],
                [[]],
                [[]]
            ],
            [
                [[],[],[]],
                [[],[],[]],
                [[]],
                [[]]
            ]
        ];
        gameApp.gridTiles.forEach(function(tile, index){
            playerCheck[tile[2]][0][(tile[1]-1)].push(tile);
            playerCheck[tile[2]][1][(tile[0]-1)].push(tile);
            if(tile[1]==tile[0]){
                playerCheck[tile[2]][2][0].push(tile);
            }
            if(parseInt(tile[1])+parseInt(tile[0])==4){
                playerCheck[tile[2]][3][0].push(tile);
            }
        });
        winner = false;
        playerCheck.forEach(function(playerAlt,index){
            playerAlt.forEach(function(direction,index){
                direction.forEach(function(row,index){
                    if(row.length === 3){
                        winner = gameApp.inGamePlayers[gameApp.playerTurn].username;
                    } else {
                    }
                });
            });
        });
        // console.log(playerCheck);
        if(winner) { return winner; }
        return false;
    },
    endGame: function(){
        gameApp.players.forEach(function(player, index){
            player.ready = false;
            player.inGame = false;
        });
        gameApp.inProgress = false;
        gameApp.inGamePlayers = [];
        gameApp.readyPlayers = [];
        gameApp.gridTiles = [];
        io.emit('stopGame', gameApp.players);
    }
}

io.on('connection', function(socket){
    var player = {
        pos_x: 1,
        pos_y: 1,
        next_pos_x: 0,
        next_pos_y: 0,
        id: playerUniqueId,
        username: '',
        ready: false,
        inGame: false
    }
    console.log('new player connected');

    playerUniqueId++;

    socket.player = player;
    gameApp.players.push(player);

    if(gameApp.inProgress){
        // socket.emit('spectate', {player:socket.player,data:{'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles}});
        socket.emit('goToLogin', socket.player);
    } else {
        console.log('go to login, as no game in progress');
        socket.emit('goToLogin', socket.player);
    }

    socket.on('disconnect', function(){
        console.log(socket.player.username+' disconected.');

        if (gameApp.players.indexOf(socket.player) !== -1) {
            gameApp.players.splice(gameApp.players.indexOf(socket.player), 1);
        }

        if (gameApp.readyPlayers.indexOf(socket.player) !== -1) {
            gameApp.readyPlayers.splice(gameApp.players.indexOf(socket.player), 1);
        }

        if (gameApp.spectatePlayers.indexOf(socket.player) !== -1) {
            gameApp.spectatePlayers.splice(gameApp.players.indexOf(socket.player), 1);
        }

        if (gameApp.inGamePlayers.indexOf(socket.player) !== -1) {
            gameApp.inGamePlayers.splice(gameApp.players.indexOf(socket.player), 1);
        }

        if(gameApp.startGameCounterCounting){
            if(gameApp.readyPlayers.length<2){
                gameApp.startGameCounterCounting = false;
                // gameApp.readyPlayers = [];
                clearTimeout(gameApp.startGameCounterTimeout);
                io.emit('startGameCounterStop',gameApp.players);
            }
        }

        if(gameApp.inProgress){
            if(gameApp.inGamePlayers.length<2){
                gameApp.endGame();
            } else {
                if(socket.player.inGame){
                    io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
                }
            }
        }
   });
   socket.on('playerReady', function(msg){
       if(!gameApp.startGameCounterCounting){
           socket.player.ready = true;
            if(gameApp.readyPlayers.indexOf(socket.player) === -1){
                gameApp.readyPlayers.push(socket.player);
            }

           if(gameApp.readyPlayers.length>1){
               if(!gameApp.inProgress){
                   gameApp.startGameCounterCounting = true;
                   gameApp.startGameCounter(gameApp.players);
                   io.emit('startGameCounter', gameApp.startGameCounterDuration)
               }
           }
           io.emit('playerReady', gameApp.players);
       } else {
           socket.emit('gameAlreadyStarting', gameApp.players);
       }
   });
   socket.on('enterLobby', function(username){
       io.emit('enterLobby', gameApp.players);
   });
   socket.on('login', function(username){
       alreadyInUse = false;
       gameApp.players.forEach(function(player, index){
           if(player.username == username){
               console.log(player.username+' is taken!');
               alreadyInUse = true;
           }
       });
       if(!alreadyInUse){
           socket.player.username = username;
           if(!gameApp.inProgress){
               socket.emit('login', socket.player);
           } else {
               socket.emit('loginAndStartGame', {player:socket.player, data: {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles}});
           }
           console.log(username+' logged in.');
       } else {
           console.log(username+' is taken username.');
       }
   });

  socket.on('spawn', function(msg){
    io.emit('spawn', msg);
    io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
  });
  socket.on('endGameAfter', function(msg){
      socket.emit('endGameAfter', socket.player);
  });

  socket.on('move right', function(msg){
      if(parseInt(socket.player.pos_x) + parseInt(gameApp.moveAmount) <= gameApp.tilesAmount){
          socket.player.pos_x = parseInt(socket.player.pos_x) + parseInt(gameApp.moveAmount);
      }
      io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
  });
  socket.on('move left', function(msg){
      if(parseInt(socket.player.pos_x) - parseInt(gameApp.moveAmount) >= 1){
          socket.player.pos_x = parseInt(socket.player.pos_x) - parseInt(gameApp.moveAmount);
      }
      io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
  });
  socket.on('move up', function(msg){
      if(parseInt(socket.player.pos_y) - parseInt(gameApp.moveAmount) >= 1){
          socket.player.pos_y = parseInt(socket.player.pos_y) - parseInt(gameApp.moveAmount);
      }
      io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
  });
  socket.on('move down', function(msg){
      if(parseInt(socket.player.pos_y) + parseInt(gameApp.moveAmount) <= gameApp.tilesAmount){
          socket.player.pos_y = parseInt(socket.player.pos_y) + parseInt(gameApp.moveAmount);
      }
      io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
  });
  socket.on('player move', function(data){
    //   if(parseInt(socket.player.pos_y) + parseInt(gameApp.moveAmount) <= gameApp.tilesAmount){
    //       socket.player.next_pos_y = parseInt(socket.player.next_pos_y) + parseInt(gameApp.moveAmount);
    //   }
    alreadyTaken = false;
    gameApp.gridTiles.forEach(function(tile, index){
        if(tile[0] == data[0] && tile[1] == data[1]) {
            alreadyTaken = true;
        }
    });

     if(!alreadyTaken) {
        gameApp.gridTiles.push([data[0], data[1], gameApp.playerTurn]);

        winner = gameApp.checkForVictory();
        if(gameApp.playerTurn == 0) {
            gameApp.playerTurn = 1;
        } else {
            gameApp.playerTurn = 0;
        }
    }

    if(winner){
        console.log('emiting victory!');
        io.emit('victory', winner);
        io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
        setTimeout(function(){
            gameApp.endGame();
        }, 3000)
    } else {
        if(gameApp.gridTiles.length < 9){
            console.log('no winner, refreshing');
            io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
        } else {
            console.log('no winner, refreshing');
            io.emit('victory', 'No one');
            io.emit('refresh', {'inGamePlayers': gameApp.inGamePlayers,'playerTurn': gameApp.playerTurn,'gridTiles': gameApp.gridTiles});
            setTimeout(function(){
                gameApp.endGame();
            }, 3000)
        }
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
