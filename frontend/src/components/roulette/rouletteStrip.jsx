import React from 'react'
import RouletteItem from './rouletteItem';
import {animated, useSpring } from 'react-spring'
 
function RouletteStrip (props) {
    
        let items = []

        for (var x = 0; x < 5; x++) {
            for (var i = 0; i < 220; i++) {
                if (i % 14 === 0) {
                    items.push(<RouletteItem color="#00c74d" key={`${x}-${i}`} id={i}/>)
                }else if (i % 2 === 0) {
                    items.push(<RouletteItem color="#31353d" key={`${x}-${i}`} id={i} />)
                } else {
                    items.push(<RouletteItem color="#de4c41" key={`${x}-${i}`} id={i} />)
                }
            }
        }

        const roll = {mass: 200, friction: 600, tension: 330, clamp: true}
        const reset = {duration: 500, clamp: true}
        
        const rollAnimation = useSpring({
            from: { marginLeft: props.marginLeft },
            to: { marginLeft: -props.marginLeft },
            reset: true,
            immediate: false,
            delay: 0,
            config: (props.roll) ? roll : reset,
        });


        return (

            
            <animated.div style={rollAnimation}>
                {items.map((item) => (item))}
            </animated.div>
            
        );




}

export default RouletteStrip; 