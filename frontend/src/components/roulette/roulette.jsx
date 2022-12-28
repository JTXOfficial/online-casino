import React, { useEffect, Component } from "react";

import styled from 'styled-components'
import RouletteGame from "./rouletteGame";

class roulette extends Component {

 

    render() {
        var Container = styled.div`
            position: absolute;
            top: 10%;
            left: 25%;
            right: 25%;
            `

        return(
            <Container>
                <RouletteGame/>
            </Container>
            
        )
    }
}

export default roulette;