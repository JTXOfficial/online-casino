import React, {Component} from 'react';
import styled from 'styled-components';
import line from '../../spin-select.svg'

class Line extends Component {
    render() {
        
        var Line = styled.div`
        position: absolute;
        left: 50%;
        shadowOpacity: 0;
        borderBottomWidth: 0;
        `


        // border-left: 6px solid black;
        // height: 100px;
        // position: absolute;
        // z-index: 1;
        // left: 50%;
        // right: 50%;

        return(

            <Line>
                <img src={line} style={{ height: '106px'}}/>
            </Line>
        )
    }
}

export default Line;