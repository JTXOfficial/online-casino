const User = require('../model/FileUser');
const Round = require('../model/FileRouletteRound');
const crypto = require('crypto');
const Bets = require('../model/FileBets');


exports = module.exports = function(io) {
    // Configure socket.io namespace with better error handling
    const nsp = io.of('/roulette');
    
    // Set up error handling for the namespace
    nsp.on('connect_error', (error) => {
        console.error('Namespace connection error:', error);
    });
    
    const rouletteState = {
        active: false,
        countdownStarted: 0,
        bets: [],
        marginLeft: 0,
    }
    
    // Start the initial countdown
    startCountdown();

    function startCountdown() {
        console.log("Starting countdown");
        rouletteState.countdownStarted = 20;
        rouletteState.active = false;
        rouletteState.bets = [];

        // Clear any existing interval
        if (global.intervalId) {
            clearInterval(global.intervalId);
        }

        // Emit initial state immediately
        nsp.emit('sync', {...rouletteState});

        // Set up the countdown interval
        global.intervalId = setInterval(() => {
            rouletteState.countdownStarted -= 1;
            console.log(`Countdown: ${rouletteState.countdownStarted}`);
            
            // Emit countdown update to clients
            nsp.emit('sync', {...rouletteState});
            
            if (rouletteState.countdownStarted <= 0) {
                clearInterval(global.intervalId);
            }
        }, 1000);
        
        // Schedule roll after countdown
        setTimeout(roll, 21000);
    }
    
    // Generate a server seed
    let clientSeed = crypto.randomBytes(32).toString('hex');
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
        console.log(`Handling bets for color: ${color}, multiplier: ${multiplier}`);
        for (var i = 0; i < rouletteState.bets.length; i++) {
            let bet = rouletteState.bets[i];
            
            if(!bet) continue;
            
            // Store socket ID for the user who placed this bet
            const socketId = bet.socketId;
            
            if (bet.color == color) {
                console.log(`Bet won: ${bet.amount} on ${bet.color}`);
                if (bet.bet && typeof bet.bet.finish === 'function') {
                    await bet.bet.finish(multiplier, (success, newBalance) => {
                        console.log(`Bet finish success: ${success}, new balance: ${newBalance}`);
                        
                        // If we have the socket ID, send a direct message to that client
                        if (socketId && nsp.sockets[socketId]) {
                            nsp.sockets[socketId].emit('betResponse', {
                                message: `You won ${bet.amount * multiplier} on ${bet.color}!`,
                                balance: newBalance,
                                won: true
                            });
                        }
                    });
                } else {
                    console.error('Invalid bet object:', bet);
                }
            } else {
                console.log(`Bet lost: ${bet.amount} on ${bet.color}`);
                if (bet.bet && typeof bet.bet.finish === 'function') {
                    await bet.bet.finish(0, (success, newBalance) => {
                        console.log(`Bet finish success: ${success}, new balance: ${newBalance}`);
                        
                        // If we have the socket ID, send a direct message to that client
                        if (socketId && nsp.sockets[socketId]) {
                            nsp.sockets[socketId].emit('betResponse', {
                                message: `You lost ${bet.amount} on ${bet.color}.`,
                                balance: newBalance,
                                won: false
                            });
                        }
                    });
                } else {
                    console.error('Invalid bet object:', bet);
                }
            }
        }
    }
    
    function roll(){
        console.log("Rolling the roulette");
        nonce = nonce + 1;
        clientSeed = crypto.randomBytes(32).toString('hex');

        // Here we use the seeds to calculate the spin (a number ranging from 0 to 14)
        const rollNumber = getRollSpin(serverSeed, clientSeed, nonce);
        const rollColour = getRollColour(rollNumber);

        const redMargin = 14500;
        const blackMargin = 14644;
        const greenMargin = 14932;

        var multiplier = 2;
        var marginLeft = 0;

        if(rollColour === 'green'){
            marginLeft = greenMargin - Math.floor(Math.random() * 70) - 50;
            multiplier = 14;
        }else if(rollColour === 'black'){
            marginLeft = blackMargin - Math.floor(Math.random() * 70) - 50;
            multiplier = 2;
        }else{
            marginLeft = redMargin - Math.floor(Math.random() * 70) - 50;
            multiplier = 2;
        } 

        rouletteState.marginLeft = marginLeft;
        rouletteState.active = true;
        rouletteState.countdownStarted = 0; // Ensure countdown is 0 during roll

        console.log(`Spin: ${rollNumber}, Spin Colour: ${rollColour}, MarginLeft: ${marginLeft}`);

        // Emit roll event to clients
        nsp.emit('roll', {
            'color': rollColour, 
            'marginLeft': marginLeft
        });

        // Handle bets
        handleBets(rollColour, multiplier);

        // Save round
        let round = new Round({
            gamemode: 'roulette',
            outcome: rollColour,
            date: new Date(),
            client_seed: clientSeed,
            server_seed: serverSeed,
        });        

        round.save(function(err){
            if (err) {
                console.error("Error saving round:", err);
            } else {
                console.log("Round saved successfully");
            }
            
            // Schedule next countdown after animation completes
            setTimeout(startCountdown, 13000);
        });
    }

    nsp.on('connection', function(socket) {
        console.log("New client connected with ID:", socket.id);
        
        // Send current state to newly connected client
        socket.emit('sync', {...rouletteState});
        
        // Log all active connections
        const connectedClients = Object.keys(nsp.sockets).length;
        console.log(`Total connected clients: ${connectedClients}`);

        // Handle getState request
        socket.on('getState', function() {
            console.log(`Client ${socket.id} requested state`);
            socket.emit('sync', {...rouletteState});
        });

        socket.on('placeBet', function(data) {
            console.log(`Client ${socket.id} placed bet:`, data);
            
            // Validate the data
            if (!data || !data.id || !data.amount || !data.color) {
                console.error("Invalid bet data:", data);
                socket.emit('betResponse', {message: 'Invalid bet data'});
                return;
            }
            
            if (rouletteState.active == false) {
                // Use the user ID from the request instead of hardcoded ID
                const userId = data.id;
                console.log(`Processing bet for user ID: ${userId}, amount: ${data.amount}, color: ${data.color}`);
                
                User.bet(userId, data.amount, 'roulette', function(success, newBet, newBalance) {
                    if (success) {
                        console.log("Bet placed successfully, new balance:", newBalance);
                        User.getUser(userId, function(userData) {
                            var bet = {
                                amount: data.amount,
                                color: data.color,
                                username: userData.username,
                                bet: newBet,
                                socketId: socket.id, // Store the socket ID with the bet
                                userId: userId // Store the user ID with the bet
                            }
            
                            rouletteState.bets.push(bet);
                            console.log("Updated bets:", rouletteState.bets);
                            
                            // Sort bets by amount (highest first)
                            rouletteState.bets = rouletteState.bets.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
                            
                            // Emit updated bets to all clients
                            nsp.emit('newBet', rouletteState.bets);
                            
                            // Also update the sync state to include the new bets
                            nsp.emit('sync', {...rouletteState});

                            // Send bet response to the client who placed the bet
                            socket.emit('betResponse', {message: 'Bet Placed', balance: newBalance})
                        });
                    } else {
                        console.log("Bet failed: Insufficient funds");
                        socket.emit('betResponse', {message: 'Insufficient funds'})
                    }
                });
            } else {
                console.log("Bet rejected: Roulette is rolling");
                socket.emit('betResponse', {message: 'Cannot bet while roulette is rolling'})
            }
        });
        
        socket.on('disconnect', function(reason) {
            console.log(`Client ${socket.id} disconnected: ${reason}`);
            const remainingClients = Object.keys(nsp.sockets).length;
            console.log(`Remaining connected clients: ${remainingClients}`);
        });
        
        socket.on('error', function(error) {
            console.error(`Socket error for client ${socket.id}:`, error);
        });
    });
}
