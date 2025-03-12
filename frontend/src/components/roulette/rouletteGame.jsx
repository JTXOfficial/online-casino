import React, { memo } from "react";
import Countdown from "./countdown";
import RouletteStrip from "./rouletteStrip";
import spin from '../../spin-select.svg';

const RouletteGame = memo(function RouletteGame({ countdown, active, winningColor, marginLeft }) {
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
    height: '10vh',
    position: 'absolute',
    //width: '0.1875rem',
    // height: '12%',
    //background: 'linear-gradient(180deg,transparent,#fff,transparent)',
    //background: 'black',
    // opacity: '.8',
    // boxShadow: '1px 1px 5px 1px black',
    // zIndex: 2
  };

  return (
    <div>
      <div style={{marginTop: '20px'}}>
        <Countdown time={countdown}/>
      </div> 
      <div style={container} id="rouletteGameContainer">
        <img src={spin} alt="line" style={line}/>
        <RouletteStrip 
          roll={active} 
          winningColor={winningColor} 
          marginLeft={marginLeft}
          countdown={countdown}
        />
      </div>
    </div>
  );
});

export default RouletteGame;