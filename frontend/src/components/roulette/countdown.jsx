import React from 'react'
import {animated, useSpring} from 'react-spring'

const Countdown = (props) => {

    const text = {
        color: 'black',
        fontSize: '.875rem',
        display: 'block',
    }

    const clock = {
        color: 'black',
        fontSize: '1.75rem',
        display: 'block',
        lineHeight: 1.1,
    
    }

    const line = {
        backgroundColor: '#00c74d',
        width: '100%',
        height: '100%',
    }

    const lineDone = {
        backgroundColor: '#00c74d',
        width: '0%',
        height: '100%',
    }

    const lineContainer = {
        dislpay: 'block',
        position: 'relative',
        textAlign: 'left',
        width: '100%',
        overflow: 'hidden',
        height: '5px',
        backgroundColor: '#1a1e23',
    }

    const countdown = useSpring({
        from: {number: props.countdown},
        to: {number: 0},
        reset: true,
        immediate: props.startCountdown,
        config: {
            duration: props.countdown * 1000
        },
        onRest: props.countdownDone,
    });

    const lineM = useSpring({
        from: {line},
        to: {lineDone},
        reset: true,
        immediate: false,
        config: {
            duration: props.countdown * 1000
        }
    });
    
    return (
        <div>
                <div style={{marginBottom: '10px', textAlign: 'center'}}>
                    <span style={text}>Rolling in</span>
                    <animated.span style={clock}>
                    {countdown.number.to(countdown =>countdown.toFixed(2))}
                    </animated.span>
                </div>
{/* 
            <div style={lineContainer}>
                <animated.span style={lineM}/>                
            </div>  */}
        </div>
    );
}

export default Countdown;