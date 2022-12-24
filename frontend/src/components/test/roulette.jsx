import React from "react";
import { Component } from "react";
import Wheel from './wheel'
import styled from 'styled-components'
import Countdown from "./countdown";


class Roulette extends Component {


    render() {

        var Title = styled.h1`
            font-size: 5rem;
            text-align: center;
            `
        return(
            <div>
                <Title>Roulette</Title>
                <Wheel/>
                <button>Roll</button>
            </div>
        )
    }
}

export default Roulette;