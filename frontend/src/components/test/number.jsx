import React, { Component } from "react";
import styled from 'styled-components'


class Number extends Component {

    render() {

        // Update margin
        var Container = styled.div`
            width: 90px;
            height: 90px; 
            border: black 1px solid;
         
            margin: 5px 1px 0px 0px; 
            display: inline-block;
        `

        var NumberText = styled.div`
            text-align: center;
            line-height: 98px;
            color: white;
            font-size: 48px;
        `

        return (
            <Container style={{ backgroundColor: this.props.color}}>
                <NumberText>{this.props.number}</NumberText>
            </Container>
            
        )
    }
}

export default Number;