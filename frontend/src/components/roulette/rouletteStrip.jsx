import React, {useState} from 'react'
import RouletteItem from './rouletteItem';
import {animated, useSpring } from 'react-spring'
 
function RouletteStrip (props) {

        let items = []

        for (var x = 0; x < 5; x++) {
            for (var i = 0; i < 15; i++) {
                if (i == 0) {
                    items.push(<RouletteItem color="#00c74d" key={`${x}-${i}`} id={i} number={15}/>)
                }else if (i % 2 == 0) {
                    items.push(<RouletteItem color="#31353d" key={`${x}-${i}`} id={i} number={14 - i}/>)
                } else {
                    items.push(<RouletteItem color="#de4c41" key={`${x}-${i}`} id={i} number={i}/>)
                }
            }
        }

        const roll = {mass: 200, friction: 600, tension: 330, clamp: true}
        const reset = {duration: 500, clamp: false}



        const rollAnimation = useSpring({
            to: {marginLeft: '0px'},
            from: {marginLeft: '-3000px'},
            reset: true,
            immediate: props.startRoll,
            delay: 0,
            config: roll,
            onRest: props.rollDone,
        })

        return (
            
            <animated.div style={rollAnimation}>
                {items.map((item) => (item))}
            </animated.div>
        );




}

export default RouletteStrip; 