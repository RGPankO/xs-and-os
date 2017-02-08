socket.on('login', function(player){
    // alert('Successfully logged in as: '+player);
    gameApp.lobby.lobbyPage(player);
});
socket.on('goToLogin', function(player){
    // console.log('go to login!');
    gameApp.loginPage(player);
});

socket.on('enterLobby', function(players){
    gameApp.lobby.enterLobby(players);
});

socket.on('playerReady', function(players){
    gameApp.lobby.playerReady(players);
});

socket.on('startGameCounter', function(duration){
    if(socket.player){
        gameApp.lobby.startGameCounter(duration);
    }
});

socket.on('startGameCounterStop', function(players){
    if(socket.player){
        gameApp.lobby.startGameCounterStop(players);
    }
});

socket.on('startGame', function(data){
    if(socket.player){
        gameApp.startGame(data);
    }
});

socket.on('loginAndStartGame', function(data){
    if(gameApp.doLogin(data.player)){
        gameApp.clearLoginPage();
        gameApp.startGame(data.data);
    }
});

socket.on('spawn', function(players){
});

socket.on('refresh', function(players){
    if(socket.player){
        gameApp.refresh(players);
    }
});

socket.on('spectate', function(players){
    gameApp.spectate(players);
});

socket.on('stopGame', function(players){
    if(socket.player){
        gameApp.stopGame(players);
    }
});

socket.on('endGameAfter', function(player){
    if(socket.player){
        gameApp.endGameAfter(player);
    }
});

socket.on('gameAlreadyStarting', function(player){
    gameApp.gameAlreadyStarting(player);
});

socket.on('victory', function(player){
    if(socket.player){
        gameApp.victory(player);
    }
});
