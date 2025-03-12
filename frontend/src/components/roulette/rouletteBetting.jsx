import React, { useState, memo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from "../../context/AuthContext";

const RouletteBetting = memo(function RouletteBetting({ bets = [], placeBet: onPlaceBet, active, connected = false, isAuthenticated = false }) {
    const { user } = useAuth();

    const container = {
        display: 'block',
        position: 'relative',
        backgroundColor: '#1a1e23',
        boxShadow: 'inset 0 1px 1px 0 rgba(0,0,0,.1)',
        borderRadius: '6px',
        textAlign: 'left',
        width: '100%',
        height: 'auto',
        minHeight: '50px',
        padding: '10px 0',
        top: '20px',
        marginBottom: '10px',
    }

    const betAmount = {
        color: 'white',
        position: 'absolute',
        lineHeight: 1,
        margin: '0.3rem',
        fontSize: '0.75rem',
        top: '-18px',
        backgroundColor: '#1a1e23',
        padding: '0 5px',
        borderRadius: '3px',
        zIndex: 1,
    }

    const betInput = {
        background: '#00000073',
        color: 'white',
        padding: '10px 10px',
        borderRadius: '5px',
        left: '10px',
        width: '50%',
        position: 'relative',
        top: '3px',
        justifyContent: 'right',
        border: 'none',
        height: '34px',
    }

    const betButton = {
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        fontSize: '0.75rem',
        marginLeft: '10px',
        position: 'relative',
        left: '15px',
        top: '0px',
        cursor: 'pointer',
        height: '34px',
        padding: '0 5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const [amount, setAmount] = useState(1);
    const [betInProgress, setBetInProgress] = useState(false);

    const addAmount = (newAmount) => {
        setAmount(prevAmount => prevAmount + newAmount);
    }

    const amountChanged = (e) => {
        if (isNaN(e.target.value) === false) {
            setAmount(Math.round(Number(e.target.value) * 100) / 100);
        }
    }

    // Add a function to set the maximum bet amount
    const setMaxAmount = () => {
        if (user && user.balance) {
            setAmount(Math.floor(user.balance * 100) / 100); // Round down to 2 decimal places
        }
    }

    const handlePlaceBet = (color) => {
        console.log("Attempting to place bet:", { amount, color, active, connected, isAuthenticated });
        
        if (!connected) {
            console.error("Cannot place bet: Socket not connected");
            return;
        }
        
        if (!isAuthenticated) {
            console.error("Cannot place bet: User not logged in");
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            console.error("Cannot place bet: Invalid amount", amount);
            return;
        }
        
        if (active) {
            console.error("Cannot place bet: Game is active");
            return;
        }

        console.log("Placing bet:", { amount, color });
        setBetInProgress(true);
        
        let bet = {
            amount: parseFloat(amount),
            color: color,
        }

        onPlaceBet(bet);
        
        // Reset bet in progress after a short delay
        setTimeout(() => {
            setBetInProgress(false);
            setAmount(1);
        }, 500);
    }

    let valueRed = 0;
    let valueGreen = 0;
    let valueBlack = 0;

    for (var i = 0; i < bets.length; i++) {
        if(bets[i].color === 'red'){
            valueRed += bets[i].amount;
        }
        if(bets[i].color === 'green'){
            valueGreen += bets[i].amount;
        }
        if(bets[i].color === 'black'){
            valueBlack += bets[i].amount;
        }
    }
        
    const isButtonDisabled = active || !isAuthenticated || !connected || betInProgress;
    const getButtonCursor = () => {
        if (active) return 'not-allowed';
        if (!isAuthenticated) return 'not-allowed';
        if (!connected) return 'not-allowed';
        if (betInProgress) return 'wait';
        return 'pointer';
    };

    return(
        <div>
            
            <div style={container}>
                <span style={betAmount}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> Bet Amount</span>
                <input type="text" value={amount} onChange={amountChanged} style={betInput} disabled={active || !connected || !isAuthenticated}/>
                <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <button style={betButton} onClick={() => setAmount(0)} disabled={!connected || !isAuthenticated}>Clear</button>
                    <button style={betButton} onClick={() => addAmount(0.01)} disabled={!connected || !isAuthenticated}>+0.01</button>
                    <button style={betButton} onClick={() => addAmount(0.10)} disabled={!connected || !isAuthenticated}>+0.10</button>
                    <button style={betButton} onClick={() => addAmount(1)} disabled={!connected || !isAuthenticated}>+1.00</button>
                    <button style={betButton} onClick={() => addAmount(10)} disabled={!connected || !isAuthenticated}>+10.00</button>
                    <button style={betButton} onClick={() => addAmount(100)} disabled={!connected || !isAuthenticated}>+100.00</button>
                    <button style={betButton} onClick={() => setAmount(prev => prev / 2)} disabled={!connected || !isAuthenticated}>1/2</button>
                    <button style={betButton} onClick={() => setAmount(prev => prev * 2)} disabled={!connected || !isAuthenticated}>x2</button>
                    <button style={betButton} onClick={setMaxAmount} disabled={!connected || !isAuthenticated}>Max</button>
                </div>
            </div>

            {!connected && (
                <div style={{
                    backgroundColor: '#ff5555',
                    color: 'white',
                    padding: '10px',
                    margin: '10px 0',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    Not connected to server. Betting is disabled.
                </div>
            )}

            <div className="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div className="my-auto">{valueRed.toFixed(2)}</div>

                    <button 
                        className="w-32 rounded bg-red-600 p-4 py-2 text-center" 
                        disabled={isButtonDisabled} 
                        onClick={() => handlePlaceBet('red')}
                        style={{cursor: getButtonCursor()}}
                    >
                        {betInProgress ? 'Betting...' : 'BET 2X'}
                    </button>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div className="my-auto">{valueGreen.toFixed(2)}</div>

                    <button 
                        className="w-32 rounded bg-green-600 p-4 py-2 text-center" 
                        disabled={isButtonDisabled} 
                        onClick={() => handlePlaceBet('green')}
                        style={{cursor: getButtonCursor()}}
                    >
                        {betInProgress ? 'Betting...' : 'BET 14X'}
                    </button>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div className="my-auto">{valueBlack.toFixed(2)}</div>
                    <button 
                        className="w-32 rounded bg-gray-600 p-4 py-2 text-center" 
                        disabled={isButtonDisabled} 
                        onClick={() => handlePlaceBet('black')}
                        style={{cursor: getButtonCursor()}}
                    >
                        {betInProgress ? 'Betting...' : 'BET 2X'}
                    </button>
                </div>
            </div>



            <div className="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div>
                        <div>{bets.filter(function(element){return element.color === 'red'}).length} Bets</div>
                    </div>

                    <div className="text-right">
                        <div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {valueRed}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div>
                        <div>{bets.filter(function(element){return element.color === 'green'}).length} Bets</div>
                    </div>

                    <div className="text-right">
                        <div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {valueGreen}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div>
                        <div>{bets.filter(function(element){return element.color === 'black'}).length} Bets</div>
                    </div>

                    <div className="text-right">
                        <div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {valueBlack}</div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                <div className="flex flex-row justify-between p-4 text-white">
                    <div>
                        {bets.filter(function(element){return element.color === 'red'}).map((player, index) => {
                        return <div key={index}>{player.username}</div>
                        })}
                    </div>

                    <div className="text-right">
                        {bets.filter(function(element){return element.color === 'red'}).map((bet, index) => {
                        return <div key={index}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet.amount}</div>
                        })}
                    </div>
                </div>
                <div className="flex flex-row justify-between p-4 text-white">
                    <div>
                        {bets.filter(function(element){return element.color === 'green'}).map((player, index) => {
                        return <div key={index}>{player.username}</div>
                        })}
                    </div>

                    <div className="text-right">
                        {bets.filter(function(element){return element.color === 'green'}).map((bet, index) => {
                        return <div key={index}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet.amount}</div>
                        })}
                    </div>
                </div>
                <div className="flex flex-row justify-between p-4 text-white">
                    <div>
                        {bets.filter(function(element){return element.color === 'black'}).map((player, index) => {
                        return <div key={index}>{player.username}</div>
                        })}
                    </div>

                    <div className="text-right">
                        {bets.filter(function(element){return element.color === 'black'}).map((bet, index) => {
                        return <div key={index}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet.amount}</div>
                        })}
                    </div>
                </div>
            </div>
        </div>

    )
})

export default RouletteBetting;