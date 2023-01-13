import React, { Component } from "react";

import styled from 'styled-components'
import RouletteGame from "./rouletteGame";
import io from 'socket.io-client'
import RouletteBetting from "./rouletteBetting";

const ENDPOINT = 'http://192.168.2.46:4000/roulette';


class roulette extends Component {

    state = {
        countdown: 0,
        active: true,
        winningColor: null,
        bets: [],
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
            bets: data.bets,
            marginLeft: data.marginLeft,
        });
        //this.props.updateBalance();
    }

    roll = (data) => {
        this.setState({
            winningColor: data.color,
            active: true,
            countdown: 0,
            marginLeft: data.marginLeft,
        })
    }

    placeBet = (data) => {
        this.socket.emit('placeBet', {
            id: '63c0c100761ef078af077752',
            amount: data.amount,
            color: data.color,
        })
    }

    handleBetResponse = (data) => {
        if (data.success === true) {
            console.log(data.message)
            this.props.updateBalance(data.balance);
        } else {
            if (data.message === 'Insufficient funds') {
                console.log(data.message);
            }
        }
    }

    betPlaced = (data) => {
        this.setState({bets: data});
    }


    componentDidMount(){
        this.socket.on('sync', this.updateState);
        this.socket.on('roll', this.roll.bind(this));
        this.socket.on('newBet', this.betPlaced);
        this.socket.on('betResponse', this.handleBetResponse);
    }

    
    componentWillUnmount(){
    }



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
                <RouletteBetting placeBet={this.placeBet} bets={this.state.bets} winningColor={this.state.winningColor} active={this.state.active}/>
            </Container>
            
        )
    }
}

export default roulette;