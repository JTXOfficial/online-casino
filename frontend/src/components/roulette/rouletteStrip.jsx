import React from 'react'
import RouletteItem from './rouletteItem';
import {animated, Spring, useSpring } from 'react-spring'
 

function RouletteStrip (props) {

        const redMargin= 14500
        const blackMargin=  14644
        const greenMargin= 14932

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

        var marginLeft;

        if(props.winningColor == 'green'){
            marginLeft = greenMargin - Math.floor(Math.random() * 70) - 50

        }else if(props.winningColor == 'black'){
            marginLeft = blackMargin - Math.floor(Math.random() * 70) - 50

        }else{
            marginLeft = redMargin - Math.floor(Math.random() * 70) - 50
        }

        const roll = {mass: 200,friction: 600, tension: 330, clamp: true}
        const reset = {duration: 500, clamp: true}


        const rollAnimation = useSpring({
            to: {marginLeft: '0px'},
            from: {marginLeft: '-3000px'},
            reset: false,
            immediate: props.roll,
            delay: 0,
            config: {
                mass: 1,
                tension: 100,
                friction: 200
            },
            onRest: props.rollDone
        })
   

        return (
            
            <animated.div style={rollAnimation}>
                {items.map((item) => (item))}
            </animated.div>
        );




}

export default RouletteStrip; 