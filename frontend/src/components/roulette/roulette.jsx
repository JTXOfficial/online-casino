import React, { Component } from "react";

import styled from 'styled-components'
import RouletteGame from "./rouletteGame";
import io from 'socket.io-client'
import RouletteBetting from "./rouletteBetting";

const ENDPOINT = 'http://192.168.2.47:4000/roulette';


class roulette extends Component {

    state = {
        countdown: 0,
        active: true,
        winningColor: null,
        players: [],
        bets: [],
        totalBets: 0,
        marginLeft: 0,
    }

    constructor() {
        super();

        this.socket = io(ENDPOINT);
    }

    updateState = (data) => {
        this.setState({
            countdown: data.countdownStarted,
            active: data.active,
            players: data.players,
            bets: data.bets,
            totalBets: data.totalBets,
            marginLeft: data.marginLeft,
        });
    }

    roll = (data) => {

        this.setState({
            winningColor: data.color,
            active: true,
            countdown: 0,
            marginLeft: data.marginLeft,
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
                <RouletteGame countdown={this.state.countdown} roll={this.state.active} winningColor={this.state.winningColor} marginLeft={this.state.marginLeft}/>
                <RouletteBetting players={this.state.players} bets={this.state.bets} totalBets={this.state.totalBets}/>
            </Container>
            
        )
    }
}

export default roulette;