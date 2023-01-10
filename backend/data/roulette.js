const User = require('../model/User');
const Round = require('../model/roulette_round');
const crypto = require('crypto');


exports = module.exports = function(io) {
    const nsp = io.of('/roulette');
    
    const rouletteState = {
        active: false,
        countdownStarted: 20
    }

    startCountdown();

    function startCountdown(){
        rouletteState.countdownStarted = 20;
        rouletteState.active = false;
        nsp.emit('sync', rouletteState);
        setTimeout(roll, 20000);
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
        nonce = nonce + 1;
        clientSeed = crypto.randomBytes(32);

        // Here we use the seeds to calculate the spin (a number ranging from 0 to 14)
        const rollNumber = getRollSpin(serverSeed, clientSeed, nonce);
        const rollColour = getRollColour(rollNumber);


        console.log(`Spin: ${rollNumber}, Spin Colour: ${rollColour}`);


        let round = new Round({
            gamemode: 'roulette',
            outcome: rollColour,
            date: new Date()
        });

        round.save(function(err){
            rouletteState.active = true;
            nsp.emit('roll', {'color': rollColour});
            setTimeout(startCountdown, 13000);
        });

    }

    nsp.on('connection', function(socket) {
        socket.emit('sync', rouletteState);
    })

}
