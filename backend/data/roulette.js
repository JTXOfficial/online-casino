const User = require('../model/User');
const Round = require('../model/roulette_round');
const crypto = require('crypto');
const Bets = require('../model/bets');


exports = module.exports = function(io) {
    const nsp = io.of('/roulette');
    
    const rouletteState = {
        active: false,
        countdownStarted: 0,
        bets: [],
        marginLeft: 0,
    }
    
    startCountdown();

    function startCountdown() {
        rouletteState.countdownStarted = 20;
        rouletteState.active = false;
        rouletteState.bets = [];


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


    async function handleBets(color, multiplier) {
        for (var i = 0; i < rouletteState.bets.length; i++) {
            let bet = rouletteState.bets[i];
            
            if(!bet) continue;
            if (bet.color == color) {
                await bet.bet.finish(multiplier, (success) => {});
            } else {
                await bet.bet.finish(0, (success) => {});
            }
        }
    }
    

    function roll(){
        nonce = nonce + 1;
        clientSeed = crypto.randomBytes(32).toString('hex');

        // Here we use the seeds to calculate the spin (a number ranging from 0 to 14)
        const rollNumber = getRollSpin(serverSeed, clientSeed, nonce);
        const rollColour = getRollColour(rollNumber);

        const redMargin = 14500
        const blackMargin = 14644
        const greenMargin = 14932

        var multiplier = 2;


        if(rollColour === 'green'){
            rouletteState.marginLeft = greenMargin - Math.floor(Math.random() * 70) - 50;
            multiplier = 14;
        }else if(rollColour === 'black'){
            rouletteState.marginLeft = blackMargin - Math.floor(Math.random() * 70) - 50;
            multiplier = 2;
        }else{
            rouletteState.marginLeft = redMargin - Math.floor(Math.random() * 70) - 50;
            multiplier = 2;
        } 

        handleBets(rollColour, multiplier);

        console.log(`Spin: ${rollNumber}, Spin Colour: ${rollColour}`);


        let round = new Round({
            gamemode: 'roulette',
            outcome: rollColour,
            date: new Date(),
            client_seed: clientSeed,
            server_seed: serverSeed,
        });        

        round.save(function(err){
            rouletteState.active = true;
            nsp.emit('roll', {'color': rollColour, 'marginLeft': rouletteState.marginLeft});
            setTimeout(startCountdown, 13000);
        });
        

    }

    nsp.on('connection', function(socket) {
        socket.emit('sync', rouletteState);

        socket.on('placeBet', function(data) {
            if (rouletteState.active == false) {
                User.bet('63c0c100761ef078af077752', data.amount, 'roulette', function(success, newBet, newBalance) {
                    if (success) {

                       User.getUser('63c0c100761ef078af077752', function(userData) {
                        var bet = {
                            amount: data.amount,
                            color: data.color,
                            username: userData.username,
                            bet: newBet,
                        }
        
                        rouletteState.bets.push(bet);
                        rouletteState.bets = rouletteState.bets.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
                        nsp.emit('newBet', rouletteState.bets);

                        socket.emit('betResponse', {message: 'Bet Placed', balance: newBalance})
                        })
                } else {
                    socket.emit('betResponse', {message: 'Insufficient funds'})
                }
            })
        } else {
            console.log('its rollign you cant bet')
        }
    })
})

}
