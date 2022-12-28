import React, { useState } from "react";
import { useEffect } from "react";
import Countdown from "./countdown";
import RouletteStrip from "./rouletteStrip";

function RouletteGame() {



    const [startRoll, setStartRoll] = useState(true);
    const [startCountdown, setStartCountdown] = useState(false);
    const [countdown, setCountdown] = useState(0);


    const countdownDone = () => {

        

        setStartRoll(false);
        setStartCountdown(true);
    };

    const rollDone = () => {
        setStartRoll(true);
        setStartCountdown(false);
        setCountdown(10);
    };
    



        //#region Styles
        const container = {
            width: '100%',
            maxWidth: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            overflow: 'hidden',
            borderRadius: '20px',
            background: 'rgba(0,0,0,.09)',
            
            boxShadow: '0 1px 0 0 hsla(0,0%,100%,.02),inset 0 1px 3px 0 rgba(0,0,0,.1)',
            whiteSpace: 'nowrap',
            zIndex: 3

        };

        const line = {
            position: 'absolute',
            width: '0.1875rem',
            height: '50%',
           //background: 'linear-gradient(180deg,transparent,#fff,transparent)',
            background: 'black',
            // opacity: '.8',

            // boxShadow: '1px 1px 5px 1px black',
            zIndex: 2
        };

        //#endregion

        return(
            <div>
                <div style={{marginTop: '20px'}}>
                    <Countdown startCountdown={startCountdown} countdown={countdown} countdownDone={countdownDone}/>
                </div>
                <div style={container} id="rouletteGameContainer">
                    <div style={line}></div>
                    <RouletteStrip startRoll={startRoll} rollDone={rollDone}/>
                </div>              
            </div>
            )
}

export default RouletteGame;