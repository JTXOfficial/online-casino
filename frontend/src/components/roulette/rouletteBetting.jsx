import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import { useState } from "react";



function RouletteBetting () {



        const [totalBets, setTotalBets] = useState(0);
        const [bets, setBets] = useState([]);
        const [player, setPlayer] = useState([]);


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

        
        const container1 = {
            display: 'flex',
            position: 'relative',
            backgroundColor: '#1a1e23',
            boxShadow: 'inset 0 1px 1px 0 rgba(0,0,0,.1)',
            borderRadius: '6px',
            textAlign: 'left',
            width: '98%',
            height: '50px',
            top: '10px',
            marginRight: '20px',
            color: 'white'
        }

        const betAmount = {
            color: 'white',
            position: 'absolute',
            lineHeight: 1,
            margin: '0.3rem',
            fontSize: '0.75rem',
            top: '-12px',
        }

        const betInput = {
            background: '#00000073',
            color: 'white',
            padding: '10px 10px',
            borderRadius: '5px',
            left: '10px',
            width: '50%',
            position: 'relative',
            top: '5px',
            justifyContent: 'right',
            border: 'none',
    

        }


        const betButton = {
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            fontSize: '0.75rem',
            marginLeft: '2px',
            position: 'relative',
            left: '10px',
            top: '5px',
            '@media (max-width: 500px)': {
                fontSize: '0.5rem',
                left: '0',
              }
              
          };



        // const betButtons = {
        //         /* width: 100%; */
        //         float: 'right',
        //         /* font-size: 18px; */
        //         fontWeight: 500,
        //         /* height: 50px; */
        //         textTransform: 'uppercase',
        //         borderRadius: '6px',
        //         padding: '7px 35px',
        //         fontSize: '14px',
        //         transition: 'background 300ms',
        //         border: 'none',
        //         marginLeft: '115px',
        //         color: 'white'

        //     }


        //     var Table = styled.table`
        //         display: table-cell;
        //     `
        
        const handleClick = () => {
            setBets([2,2])
            setPlayer(['Ryan', 'Tigan'])
        }
      
          
        return( 
            <div>
                
                <div style={container}>
                    <span style={betAmount}><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> Bet Amount</span>
                    <input type="text" placeholder="0.20" style={betInput}/>
                        <button style={betButton}>Clear</button>
                        <button style={betButton}>+0.01</button>
                        <button style={betButton}>+0.10</button>
                        <button style={betButton}>+1.00</button>
                        <button style={betButton}>+10.00</button>
                        <button style={betButton}>+100.00</button>
                        <button style={betButton}>1/2</button>
                        <button style={betButton}>x2</button>
                        <button style={betButton}>Max</button>
                </div>

                <div class="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                    <div class="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                        <div class="my-auto">0.00</div>

                        <button class="w-32 rounded bg-red-600 p-4 py-2 text-center" onClick={handleClick}>BET 2X</button>
                    </div>
                    <div class="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                        <div class="my-auto">0.00</div>

                        <button class="w-32 rounded bg-green-600 p-4 py-2 text-center">BET 14X</button>
                    </div>
                    <div class="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                        <div class="my-auto">0.00</div>
                        <button class="w-32 rounded bg-gray-600 p-4 py-2 text-center">BET 2X</button>
                    </div>
                </div>



                <div class="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                    <div class="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                        <div>
                            <div>0 Bets</div>
                        </div>

                        <div class="text-right">
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {totalBets}</div>
                        </div>
                    </div>
                    <div class="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                        <div>
                            <div>0 Bets</div>
                        </div>

                        <div class="text-right">
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 0</div>
                        </div>
                    </div>
                    <div class="flex flex-row justify-between rounded bg-dark-grey p-4 text-white">
                        <div>
                            <div>0 Bets</div>
                        </div>

                        <div class="text-right">
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 0</div>
                        </div>
                    </div>
                </div>


                <div class="grid space-y-3 p-4 sm:grid-cols-3 sm:space-y-0 sm:space-x-3">
                    <div class="flex flex-row justify-between p-4 text-white">
                        <div>
                            {player.map(player => <div>{player}</div>)}
                        </div>

                        <div class="text-right">
                            {bets == 0 ? (
                                
                                <div/>
                            ) : (
                                bets.map(bet => <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> {bet}</div>)
                            )}
                        </div>
                    </div>
                    <div class="flex flex-row justify-between p-4 text-white">
                        <div>
                            <div>Player 2</div>
                            <div>Player 2</div>

                        </div>

                        <div class="text-right">
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 12.00</div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 12.00</div>
                        </div>
                    </div>
                    <div class="flex flex-row justify-between p-4 text-white">
                        <div>
                            <div>Player 3</div>
                            <div>Player 3</div>
                            <div>Player 3</div>
                            <div>Player 3</div>

                        </div>

                        <div class="text-right">
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 1.50</div>
                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 1.50</div>

                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 1.50</div>

                            <div><FontAwesomeIcon icon={faCoins} style={{color: 'gold'}}/> 1.50</div>

                        </div>
                    </div>
                </div>
            </div>

        )
    
}

export default RouletteBetting;