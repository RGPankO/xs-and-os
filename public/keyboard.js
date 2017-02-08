$(document).keydown(function(e) {
     // prevent the default action (scroll / move caret)
     // console.log('pressing keyboard...');
     // console.log('pressing: '+e.which);
    if(gameApp.state=='inGame'){
        console.log('we are in game!');
        var lockKeys = [37,38,39,40];
        // console.log('check result:'+lockKeys.indexOf(e.which));
        if (!lockKeys.indexOf(e.which) === -1) {
            console.log('preventing keyboard!');
            e.preventDefault();
        }
        console.log('gameApp.myTurn is:');
        console.log(gameApp.myTurn);
        if(gameApp.myTurn){
            console.log('my Turn so we emit keyboard');
          switch(e.which) {
              case 32:
              console.log('spacebar send data is: ====-=-=-=-=-');
              console.log(gameApp.playerMoveData());
                socket.emit('player move', gameApp.playerMoveData());
              break;
              case 37: // left
                // console.log('moving left');
                  socket.emit('move left', '');
              break;

              case 38: // up
                // console.log('moving up');
                  socket.emit('move up', '');
              break;

              case 39: // right
                // console.log('moving right');
                  socket.emit('move right', '');
              break;

              case 40: // down
                // console.log('moving down');
                  socket.emit('move down', '');
              break;

              default: return; // exit this handler for other keys
          }
        }
  }
});
