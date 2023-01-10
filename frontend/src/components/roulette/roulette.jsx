import React, { Component } from "react";

import styled from 'styled-components'
import RouletteGame from "./rouletteGame";
import io from 'socket.io-client'
import RouletteBetting from "./rouletteBetting";

const ENDPOINT = 'http://localhost:4000/roulette';


class roulette extends Component {

    state = {
        countdown: 0,
        active: true,
        winningColor: null,
    }

    constructor() {
        super();

        this.socket = io(ENDPOINT);
    }

    updateState = (data) => {
        this.setState({
            countdown: data.countdownStarted,
            active: data.active
        });
    }

    roll = (data) => {

        this.setState({
            winningColor: data.color,
            active: true,
            countdown: 0
        })
    }
    


    componentDidMount(){
        this.socket.on('sync', this.updateState);
        this.socket.on('roll', this.roll.bind(this));
    }
    componentWillUnmount(){
    }

    // top: 10%;
    // left: 25%;
    // right: 25%;
 

    render() {
        var Container = styled.div`
            position: absolute;
            width: 100%;
            height: 100%;
    
            background-color: #172327;
            `

        return(
            <Container>
                <RouletteGame countdown={this.state.countdown} roll={this.state.active} winningColor={this.state.winningColor}/>
                <RouletteBetting/>
            </Container>
            
        )
    }
}

export default roulette;