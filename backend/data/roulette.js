const User = require('../model/User');
const Round = require('../model/roulette_round');


exports = module.exports = function(io) {
    const nsp = io.of('/roulette');
    
    const rouletteState = {
        startRoll: true,
        startCountdown: false,
        countdownStarted: new Date()
    }

    countdown();

    function countdown() {
        rouletteState.startRoll = false;
        rouletteState.startCountdown = true;
        rouletteState.countdownStarted = new Date();
        nsp.emit('countdown', rouletteState);
        setTimeout(roll, 20000)
    }


    function roll(){
        var winningColor = 'red';
        var multiplier = 2;
        Math.floor(Math.random() * 15);

        if(Math.floor(Math.random() * 15) == 0){
            winningColor = 'green';
            multiplier = 14;
        }else if(Math.random() >= 0.5){
            winningColor = 'red';
            multiplier = 2;
        }else{
            winningColor = 'black';
            multiplier = 2;
        }

        let round = new Round({
            gamemode: 'roulette',
            outcome: winningColor,
            date: new Date()
        });

        round.save(function(err){
            console.log('Rolling: ' + winningColor);
            rouletteState.startRoll = false;
            rouletteState.startCountdown = true;
            nsp.emit('roll', {'color': winningColor});
            setTimeout(countdown, 13000);
        });

    }

    nsp.on('connection', function(socket) {
        socket.emit('sync', rouletteState);
    })

}
