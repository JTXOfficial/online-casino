const User = require('../model/User');
const Round = require('../model/roulette_round');
const crypto = require('crypto');


exports = module.exports = function(io) {
    const nsp = io.of('/roulette');
    
    const rouletteState = {
        active: false,
        countdownStarted: 0,
        players: [],
        bets: [],
        totalBets: 0,
        marginLeft: 0,
    }

    startCountdown();

    function startCountdown(){
        rouletteState.players.length = 0;
        rouletteState.bets.length = 0;
        rouletteState.totalBets = 0;
        rouletteState.countdownStarted = 20;
        rouletteState.active = false;

        intervalId = setInterval(() => {
            rouletteState.countdownStarted -= 1;
            if (rouletteState.countdownStarted <= 0) {
                clearInterval(intervalId);
            }
            console.log(rouletteState.countdownStarted)

        }, 1000)

        nsp.emit('sync', rouletteState);
        setTimeout(roll, 21000);
    }
    
    // Generate a server seed
    let clientSeed = "";
    // Hash the server seed to create a public seed
    const serverSeed = crypto.createHash('sha256').update(clientSeed).digest('hex');
    var nonce = 0;
    
    function getRollSpinFromHash(hash) {
        const subHash = hash.substr(0, 8);
        const spinNumber = parseInt(subHash, 16);
        return Math.abs(spinNumber) % 15;
    }

    function getRollSpin(serverSeed, clientSeed, nonce) {
        const seed = getCombinedSeed(serverSeed, clientSeed, nonce);
        const hash = crypto.createHmac('sha256', seed).digest('hex');
        return getRollSpinFromHash(hash);
    }
    
    function getCombinedSeed(serverSeed, clientSeed, nonce) {
        return [serverSeed, clientSeed, nonce].join('-');
    }

    function getRollColour(roll) {
        if(roll === 0) {
          return 'green';
        } else if(roll % 2 == 0) {
          return 'black';
        } else {
            return 'red'
        }
    }
    

    function roll(){
        rouletteState.players = ["Ryan", "Ronald"];
        rouletteState.bets = [128, 44];
        rouletteState.totalBets = rouletteState.bets.reduce((a, v) => a = a + v, 0);

        
        nonce = nonce + 1;
        clientSeed = crypto.randomBytes(32);

        // Here we use the seeds to calculate the spin (a number ranging from 0 to 14)
        const rollNumber = getRollSpin(serverSeed, clientSeed, nonce);
        const rollColour = getRollColour(rollNumber);

        const redMargin = 14500
        const blackMargin = 14644
        const greenMargin = 14932


        if(rollColour === 'green'){
            rouletteState.marginLeft = greenMargin - Math.floor(Math.random() * 70) - 50;
        }else if(rollColour === 'black'){
            rouletteState.marginLeft = blackMargin - Math.floor(Math.random() * 70) - 50;
        }else{
            rouletteState.marginLeft = redMargin - Math.floor(Math.random() * 70) - 50;
        } 

        nsp.emit('sync', rouletteState);


        console.log(`Spin: ${rollNumber}, Spin Colour: ${rollColour}`);


        let round = new Round({
            gamemode: 'roulette',
            outcome: rollColour,
            date: new Date()
        });
        

        round.save(function(err){
            rouletteState.active = true;
            nsp.emit('roll', {'color': rollColour, 'marginLeft': rouletteState.marginLeft});
            setTimeout(startCountdown, 13000);
        });
        

    }

    nsp.on('connection', function(socket) {
        socket.emit('sync', rouletteState);
    })

}
