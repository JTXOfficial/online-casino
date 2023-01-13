import React, {useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'

function RouletteBetting (props) {

    const container = {
        display: 'block',
        position: 'relative',
        backgroundColor: '#1a1e23',
        boxShadow: 'inset 0 1px 1px 0 rgba(0,0,0,.1)',
        borderRadius: '6px',
        textAlign: 'left',
        width: '100%',
        height: '50px',
        top: '10px'
    }

    const betAmount = {
        color: 'white',
        position: 'absolute',
        lineHeight: 1,
        margin: '0.3rem',
        fontSize: '0.75rem',
        top: '-11px',
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


    }


    const betButton = {
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        fontSize: '0.75rem',
        marginLeft: '10px',
        position: 'relative',
        left: '15px',
        top: '5px',
        };

    const [amount, setAmount] = useState(1);

    const addAmount = (newAmount) => {
        setAmount(amount + newAmount);
    }

    const amountChanged = (e) => {
        if (isNaN(e.target.value) === false) {
            setAmount(Math.round(Number(e.target.value) * 100) / 100);
        }
    }

    const placeBet = (color) => {
        if (isNaN(amount) || amount <= 0) {
            return;
        }

        let bet = {
            amount: amount,
            color: color,
        }

        props.placeBet(bet);
        setAmount(1);
    }



    let valueRed = 0;
    let valueGreen = 0;
    let valueBlack = 0;

    for (var i = 0; i < props.bets.length; i++) {
        if(props.bets[i].color === 'red'){
            valueRed += props.bets[i].amount;
        }
        if(props.bets[i].color === 'green'){
            valueGreen += props.bets[i].amount;
        }
        if(props.bets[i].color === 'black'){
            valueBlack += props.bets[i].amount;
        }
    }
        
    return(
        <div>
            
            <div style={container}>
                <span style={betAmount}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> Bet Amount</span>
                <input type="text" value={amount} onChange={amountChanged} style={betInput}/>
                    <button style={betButton} onClick={() => setAmount(0)}>Clear</button>
                    <button style={betButton} onClick={() => addAmount(0.1)}>+0.01</button>
                    <button style={betButton} onClick={() => addAmount(0.10)}>+0.10</button>
                    <button style={betButton} onClick={() => addAmount(1)}>+1.00</button>
                    <button style={betButton} onClick={() => addAmount(10)}>+10.00</button>
                    <button style={betButton} onClick={() => addAmount(100)}>+100.00</button>
                    <button style={betButton}>1/2</button>
                    <button style={betButton}>x2</button>
                    <button style={betButton}>Max</button>
            </div>

            <div className="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div className="my-auto">0.00</div>

                    <button className="w-32 rounded bg-red-600 p-4 py-2 text-center" active={props.roll} onClick={() =>  {placeBet('red');}}>BET 2X</button>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div className="my-auto">0.00</div>

                    <button className="w-32 rounded bg-green-600 p-4 py-2 text-center" active={props.roll} onClick={() => {placeBet('green');}}>BET 14X</button>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div className="my-auto">0.00</div>
                    <button className="w-32 rounded bg-gray-600 p-4 py-2 text-center" active={props.roll} onClick={() => {placeBet('black');}}>BET 2X</button>
                </div>
            </div>



            <div className="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div>
                        <div>{props.bets.filter(function(element){return element.color === 'red'}).length} Bets</div>
                    </div>

                    <div className="text-right">
                        <div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {valueRed}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div>
                        <div>{props.bets.filter(function(element){return element.color === 'green'}).length} Bets</div>
                    </div>

                    <div className="text-right">
                        <div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {valueGreen}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                    <div>
                        <div>{props.bets.filter(function(element){return element.color === 'black'}).length} Bets</div>
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
                        {props.bets.filter(function(element){return element.color === 'red'}).map((player, index) => {
                        return <div key={index}>{player.username}</div>
                        })}
                    </div>

                    <div className="text-right">
                        {props.bets.filter(function(element){return element.color === 'red'}).map((bet, index) => {
                        return <div key={index}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet.amount}</div>
                        })}
                    </div>
                </div>
                <div className="flex flex-row justify-between p-4 text-white">
                    <div>
                        {props.bets.filter(function(element){return element.color === 'green'}).map((player, index) => {
                        return <div key={index}>{player.username}</div>
                        })}
                    </div>

                    <div className="text-right">
                        {props.bets.filter(function(element){return element.color === 'green'}).map((bet, index) => {
                        return <div key={index}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet.amount}</div>
                        })}
                    </div>
                </div>
                <div className="flex flex-row justify-between p-4 text-white">
                    <div>
                        {props.bets.filter(function(element){return element.color === 'black'}).map((player, index) => {
                        return <div key={index}>{player.username}</div>
                        })}
                    </div>

                    <div className="text-right">
                        {props.bets.filter(function(element){return element.color === 'black'}).map((bet, index) => {
                        return <div key={index}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet.amount}</div>
                        })}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default RouletteBetting;