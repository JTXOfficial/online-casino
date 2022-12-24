import React, { Component } from "react";

import styled from 'styled-components'
import RouletteGame from "./rouletteGame";

class roulette extends Component {

    state = {
        roll: false,
        winningColor: null,
        countdown: 0,
        count: true,
    }


    componentDidMount(){
        this.rouletteStart = setInterval(() => {
            this.setState({roll: true, count: false})
        }, 10000)
    }

 

    countdownDone = () => {
        this.setState({roll: false, count: true});
    }

    rollDone = () => {
        this.setState({roll: true, count: false});
    }

    roll = (data) => {
        this.setState({winningColor: data.color, roll: true, countdown: 0});
    }

    render() {

        var Container = styled.div`
            position: absolute;
            top: 10%;
            left: 25%;
            right: 25%;
            `

        return(
            <Container>
                <RouletteGame roll={this.state.roll}  rollDone={this.rollDone} winningColor={this.state.winningColor} count={this.state.count} countdownDone={this.countdownDone} countdown={this.state.countdown}/>
            </Container>
            
        )
    }
}

export default roulette;