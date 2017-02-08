var lobby = {
    startGameCounterValue: 0,
    lobbyPage: function(player){
        if(!$('#lobbyPage').length){
            $playground = $('<div/>', {
                id: 'lobbyPage',
            }).prependTo($('#gameApp'));
        };
        console.log('lobby page player var passed is:');
        console.log(player);
        socket.player = player;
        gameApp.state = 'lobby';
        socket.emit('enterLobby', '');
    },
    enterLobby: function(players){
        if(gameApp.state=='lobby'){
            gameApp.clearLoginPage();
            $lobbyPage = $('#lobbyPage');
            if(!$('#lobbyPlayerList').length){
                $lobbyPlayerList = $('<ol/>', {
                    id: 'lobbyPlayerList'
                }).appendTo($lobbyPage);
            } else {
                $lobbyPlayerList = $('#lobbyPlayerList');
            }

            this.refreshLobby($lobbyPlayerList, players)

            if(!$('#readyBtn').length){
                $readyBtn = $('<button/>', {
                    id: 'readyBtn',
                    text: 'Ready!',
                    type: "button"
                }).appendTo($lobbyPage);
                $('#readyBtn').click(function(){
                    socket.emit('playerReady', '');
                });
            }
        }
    },
    refreshLobby: function($lobbyPlayerList,players){
        console.log('--==refresh lobby function==--');
        $lobbyPlayerList.html('')
        players.forEach(function(player, index){
            className = 'item';
            if(player.ready) {
                className = className+' green';
            } else {
                className = className+' red';
            }
            if(player.username){
                $('<li/>', {
                    class: 'item'+className
                }).text(player.username).appendTo($lobbyPlayerList);
            }
        });
    },
    playerReady: function(players){
        $lobbyPlayerList = $('#lobbyPlayerList');
        this.refreshLobby($lobbyPlayerList, players);
        // $players
    },
    startGameCounter: function(duration){
        console.log('--==start counter function==--');
        gameApp.lobby.startGameCounterValue = parseInt(duration);
        if(!$('#startGameCounter').length){
            $startGameCounter = $('<div/>', {
                id: 'startGameCounter',
                text: duration
            }).appendTo($('#gameApp'));
        } else {
            $startGameCounter = $('#startGameCounter');
        }
        clearTimeout(gameApp.lobby.startGameCounterRefresher);
        gameApp.lobby.startGameCounterRefresher = setInterval(gameApp.lobby.startGameCounterRefresh, 1000);
    },
    startGameCounterRefresh: function(){
        console.log('--==start counter refresh function==--');
        $startGameCounter = $('#startGameCounter');
        if(parseInt(gameApp.lobby.startGameCounterValue-1000) > -1){
            $startGameCounter.text(parseInt(gameApp.lobby.startGameCounterValue-1000));
            gameApp.lobby.startGameCounterValue = parseInt(gameApp.lobby.startGameCounterValue - 1000);
        } else {
            clearTimeout(gameApp.lobby.startGameCounterRefresher);
            gameApp.lobby.startGameCounterRefreshFinish();
        }
    },
    startGameCounterRefreshFinish: function(){
        console.log('--==finished counter function==--');
         $startGameCounter = $('#startGameCounter');
         $('#startGameCounter').text('START!');
         gameApp.lobby.startGameCounterRefresher = setTimeout(function(){ $startGameCounter.remove(); }, 1000);
    },
    startGameCounterStop: function(players){
        console.log('--==stop counter function==--');
        clearTimeout(gameApp.lobby.startGameCounterRefresher);
         $('#startGameCounter').text('Game Start Canceled!');
         playerss = players;
        gameApp.lobby.startGameCounterRefresher = setTimeout(function(){
            $('#startGameCounter').slideUp().remove();
            playersss = playerss;
            gameApp.lobby.startGameCounterRefresher = setTimeout(function(){
                gameApp.lobby.refreshLobby($('#lobbyPlayerList'),playersss)
            }, 3000);
        }, 1000);
    },
    cleanUpLobby: function(){
        console.log('cleaning up the lobby');
        clearTimeout(gameApp.lobby.startGameCounterRefresher);
        gameApp.lobby.startGameCounterRefresher = 0;
        $('#startGameCounter').remove();
        $('#lobbyPage').remove();
    }
}
