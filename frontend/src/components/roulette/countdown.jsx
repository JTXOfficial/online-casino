import React from 'react'
import {animated, useSpring} from 'react-spring'

const Countdown = (props) => {

    const text = {
        color: 'black',
        fontSize: '.875rem',
        display: 'block',
        
    }

    const clock = {
        color: 'white',
        fontSize: '1rem',
        display: 'block',
        lineHeight: 1.1,
        position: 'relative',
        top: '30px'
    
    }


    let time = props.time;


    const countdown = useSpring({
        from: {number: time},
        to: {number: 0},
        reset: true,
        immediate: false,
        config: {
            duration: time * 1000
        },
    });

    const progressSpring = useSpring({
        from: { width: '100%' },
        to: { width: '0%' },
        reset: true,
        immediate: false,
        config: {
          duration: time * 1000
        }
      });

    
    
    return (
        <div>
            
            <div style={{marginBottom: '10px', textAlign: 'center'}}> 
            <animated.div style={clock}>
                    {countdown.number.to(countdown => {
                    if (countdown === 0) {
                        return 'Rolling...';
                    } else {
                        return countdown.toFixed(2);
                    }
                    })}
            </animated.div>
            <animated.div style={{...progressSpring, background: '#00c74d', height: '40px', borderRadius: '5px'}}/>
            </div>
        </div>
    );
}

export default Countdown;