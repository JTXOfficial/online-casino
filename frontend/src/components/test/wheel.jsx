import React, { Component } from "react";
import Number from "./number";
import Line from './line'
import styled from 'styled-components'
import {Spring, config} from 'react-spring'

class Wheel extends Component {

    render() {

        var numbers = [];

        for (var i = 1; i < 15; i++) {

            if (i == 0) {
                numbers.push({ color : 'green', number: 15 });
            }
            numbers.push({
                color: (i % 2 == 0) ? 'black' : 'red',
                number: (i % 2 == 0) ? 14 - i : i
            });
        }

        var Container = styled.div`
            width: 100%;
            height: 100px;
            border: solid black 2px;
            overflow: hidden;
            white-space: nowrap;
            `

        return(
            <Container>
                <Line/>
                <div>
                    {numbers.map((item) => (
                        <Number color={item.color} number={item.number}/>
                    ))}
                </div>
            </Container>
        )
    }
}

export default Wheel;