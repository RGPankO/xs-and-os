var socket = io();

// socket.emit('spawn', '');
var loginHtml = $('#loginForm');
var gameApp = {
    state: 'login',
    startGameCounterValue: 0,
    loginForm: $('#loginForm'),
    myTurn: false,
    init: function(){
        this.loginPage();
    },
    loginPage: function(){
        // console.log($('#gameApp'));
        // gameApp.clearLoginPage();
        // gameApp.cleanGame();
        // gameApp.lobby.cleanUpLobby();
        $('#gameApp').html('').append(gameApp.loginForm);
        gameApp.loginForm.slideDown();
        // console.log($('#loginForm'));
        $('#loginForm').submit(function(e){
            e.preventDefault();
             socket.emit('login', $('#usernameField').val());
        });
    },
    doLogin: function(player){
        socket.player = player;
        return true;
    },
    lobby: lobby,
    startGame: function(data){
        gameApp.state = 'inGame';
        gameApp.lobby.cleanUpLobby();
        if(gameApp.createGrid()) {
            gameApp.refresh(data);
        }
    },
    createGrid: function(){
        $playground = $('<div/>', {
            id: 'playground',
        }).prependTo('body');

        var grid_x = 3;
        var grid_y = 3;
        for(x = 1; x <= grid_x; x++){
            for(y = 1; y <= grid_y; y++){
                $new_item = $('<div/>', {
                    id: 'grid-'+y+'-'+x,
                    class: 'grid-item',
                }).appendTo('#playground');
            }
        }
        return true;
    },
    refresh: function(data){
        // console.log(data);
        $('#playground').find('.tile, .player-tile').remove();
        data.gridTiles.forEach(function(tile, index){
            // if(player.inGame){
                if(tile[2]){ marker = 'X'; playerColor= ' red-light '; } else { marker = 'O'; playerColor= ' green-light '; }
                $new_tile = $('<div/>', {
                    class: 'tile' + playerColor,
                }).append($('<div/>', {
                    class: 'tile-sign',
                }).text(marker)).appendTo('#grid-'+tile[0]+'-'+ tile[1]);
            // }
        });
        if(data.playerTurn){ playerColor= ' red '; } else { playerColor= ' green '; }
        $playerTile = $('<div/>', {
            class: ' player-tile '+playerColor,
        }).append($('<div/>', {
            class: ' player-name '+playerColor,
        }).text(data.inGamePlayers[data.playerTurn].username)).appendTo('#grid-'+data.inGamePlayers[data.playerTurn].pos_x+'-'+ data.inGamePlayers[data.playerTurn].pos_y);
        // console.log('refreshing data player turn:');
        // console.log(data.inGamePlayers[data.playerTurn].username);
        console.log('socket player is:');
        console.log(socket.player);
        if(data.inGamePlayers[data.playerTurn].username == socket.player.username){
            gameApp.myTurn = true;
        } else {
            gameApp.myTurn = false;
        }
    },
    spectate: function(data){
        socket.player = data.player;
        gameApp.clearLoginPage();
        gameApp.startGame(data.data);
    },
    stopGame: function(players){
        gameApp.cleanGame();
        socket.emit('endGameAfter', '')
    },
    endGameAfter: function(player){
        console.log('received player is: !!!!');
        console.log(player);
        if(player.username){
            // socket.player = player;
            console.log('SOCKET PLAYER AFTER =====');
            console.log(socket.player);
            gameApp.lobby.lobbyPage(player);
        } else {
            gameApp.loginPage();
        }
    },
    cleanGame: function(){
        $('#playground').remove();
    },
    gameAlreadyStarting: function(){
        $gameAlreadyStarting = $('<div/>', {
            id: 'gameAlreadyStarting',
        }).text('Game is already starting, please wait for it to finish!').appendTo('body');
        // console.log();
        setTimeout(function(){
            $gameAlreadyStarting.remove();
        }, 1000);
    },
    clearLoginPage: function(){
        $('#loginForm').hide();
    },
    playerMoveData: function(){
        data = $('.player-tile').parents('.grid-item').first().attr('id').split("-");
        return [data[1],data[2]];
    },
    victory: function(username){
        $gameAlreadyStarting = $('<div/>', {
            id: 'gameAlreadyStarting',
        }).text(username+' won the game!').appendTo('body');
        // console.log();
        setTimeout(function(){
            $gameAlreadyStarting.remove();
        }, 3000);
    }
}
gameApp.init();
// setInterval(function(){
//     console.log('====SOCKET PLAYER====');
//     console.log(socket.player);
//     console.log('=====================');
// },3000);
