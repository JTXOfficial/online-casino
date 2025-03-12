import React, { useRef, useEffect, useState } from 'react'
import RouletteItem from './rouletteItem';
import {animated} from 'react-spring'
 
function RouletteStrip (props) {
    // State for the visual position (margin-left)
    const [marginLeft, setMarginLeft] = useState(0);
    
    // Animation control refs
    const positionRef = useRef(0);
    const velocityRef = useRef(0);
    const animationFrameRef = useRef(null);
    const lastFrameTimeRef = useRef(0);
    const targetPositionRef = useRef(null);
    const rollStartTimeRef = useRef(null);
    const isRollingRef = useRef(false);
    const winningColorRef = useRef(null);
    
    // Track previous states to detect changes
    const prevRollRef = useRef(false);
    const prevCountdownRef = useRef(props.countdown || 0);
    
    // Animation configuration
    const ROLL_DURATION = 13000; // 13 seconds total roll time to match backend
    const MAX_VELOCITY = 30;     // Maximum velocity during fast phase
    const MIN_VELOCITY = 0.5;    // Minimum velocity during final approach
    const FINAL_PRECISION = 0.1; // How close we need to be to target (in pixels)
    
    // Clean up animation on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);
    
    // Handle visibility change (tab switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pause animation when tab is hidden
                pauseAnimation();
            } else if (isRollingRef.current) {
                // Resume animation when tab becomes visible again
                requestAnimationFrame(animationLoop);
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);
    
    // Handle countdown reaching zero
    useEffect(() => {
        if (prevCountdownRef.current > 0 && props.countdown === 0 && !isRollingRef.current && !props.roll) {
            console.log("Countdown reached zero, starting pre-roll animation");
            startRolling();
        }
        prevCountdownRef.current = props.countdown;
    }, [props.countdown]);
    
    // Handle roll state changes from server
    useEffect(() => {
        // New roll started
        if (props.roll && !prevRollRef.current) {
            console.log("New roll started with target:", -props.marginLeft);
            targetPositionRef.current = -props.marginLeft;
            
            // Determine winning color based on marginLeft
            if (props.marginLeft >= 14850 && props.marginLeft <= 15000) {
                winningColorRef.current = 'green';
            } else if (props.marginLeft >= 14550 && props.marginLeft < 14850) {
                winningColorRef.current = 'black';
            } else {
                winningColorRef.current = 'red';
            }
            
            console.log(`Winning color determined: ${winningColorRef.current}`);
            
            if (!isRollingRef.current) {
                startRolling();
            }
        }
        
        // Roll stopped by server
        if (!props.roll && prevRollRef.current) {
            console.log("Roll stopped by server, landing on:", -props.marginLeft);
            targetPositionRef.current = -props.marginLeft;
            finishRoll();
        }
        
        prevRollRef.current = props.roll;
    }, [props.roll, props.marginLeft]);
    
    // Start the rolling animation
    const startRolling = () => {
        console.log("Starting roll animation");
        
        // Initialize animation state
        isRollingRef.current = true;
        rollStartTimeRef.current = performance.now();
        lastFrameTimeRef.current = performance.now();
        velocityRef.current = 0; // Start from zero velocity
        
        // Cancel any existing animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Start the animation loop
        animationFrameRef.current = requestAnimationFrame(animationLoop);
    };
    
    // Pause the animation (when tab is hidden)
    const pauseAnimation = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };
    
    // Finish the roll and go to final position
    const finishRoll = () => {
        pauseAnimation();
        isRollingRef.current = false;
        
        // If we have a target position, go directly to it
        if (targetPositionRef.current !== null) {
            // Ensure we land exactly on the target position
            positionRef.current = targetPositionRef.current;
            setMarginLeft(targetPositionRef.current);
            console.log(`Animation finished, final position: ${targetPositionRef.current}`);
        }
    };
    
    // The main animation loop
    const animationLoop = (timestamp) => {
        if (!isRollingRef.current) return;
        
        // Calculate time delta
        const deltaTime = lastFrameTimeRef.current ? (timestamp - lastFrameTimeRef.current) / 1000 : 0.016;
        lastFrameTimeRef.current = timestamp;
        
        // Calculate elapsed time as a percentage of total duration
        const elapsedTime = timestamp - rollStartTimeRef.current;
        const progress = Math.min(1, elapsedTime / ROLL_DURATION);
        
        // Check if we're very close to the target in the final phase
        if (targetPositionRef.current !== null && progress > 0.95) {
            const distanceToTarget = Math.abs(targetPositionRef.current - positionRef.current);
            
            // If we're very close to target, snap to it and finish
            if (distanceToTarget < FINAL_PRECISION) {
                finishRoll();
                return;
            }
        }
        
        // Update velocity based on animation phase
        updateVelocity(progress, deltaTime);
        
        // Update position based on velocity
        positionRef.current -= velocityRef.current * deltaTime * 60; // Scale by 60 to normalize to 60fps
        setMarginLeft(positionRef.current);
        
        // Check if we need to finish the animation
        if (progress >= 1 && targetPositionRef.current !== null) {
            finishRoll();
            return;
        }
        
        // Continue the animation
        animationFrameRef.current = requestAnimationFrame(animationLoop);
    };
    
    // Update velocity based on animation progress
    const updateVelocity = (progress, deltaTime) => {
        // If we have a target and we're in the final phase, adjust to hit target
        if (targetPositionRef.current !== null && progress > 0.85) {
            const distanceToTarget = targetPositionRef.current - positionRef.current;
            const timeRemaining = Math.max(0.001, (1 - progress) * ROLL_DURATION / 1000);
            
            // Blend between physics-based and target-based velocity
            const blendFactor = Math.min(1, (progress - 0.85) / 0.15);
            
            // Calculate velocity needed to reach target exactly
            const targetVelocity = distanceToTarget / timeRemaining / 60;
            
            // As we get closer to the end, prioritize hitting the target exactly
            const endBlendFactor = progress > 0.95 ? 0.9 : blendFactor;
            
            // Apply velocity with blending
            velocityRef.current = velocityRef.current * (1 - endBlendFactor) + targetVelocity * endBlendFactor;
            
            // Add slight oscillation for realism, but reduce it as we approach target
            if (progress < 0.95) {
                const oscillationAmount = 0.1 * (1 - (progress - 0.85) / 0.1);
                velocityRef.current *= (1 + Math.sin(progress * 30) * oscillationAmount);
            }
            
            return;
        }
        
        // Different phases of animation
        if (progress < 0.1) {
            // Initial acceleration phase (0-10%)
            const accelProgress = progress / 0.1;
            const targetVel = MAX_VELOCITY * easeInQuad(accelProgress);
            velocityRef.current = lerp(velocityRef.current, targetVel, Math.min(1, deltaTime * 5));
        } 
        else if (progress < 0.6) {
            // Fast spinning phase (10-60%)
            // Add subtle variations for realism
            const variation = Math.sin(progress * 50) * 2;
            velocityRef.current = MAX_VELOCITY + variation;
        } 
        else if (progress < 0.9) {
            // Slowing down phase (60-90%)
            const slowProgress = (progress - 0.6) / 0.3;
            
            // Add oscillation for realistic physics
            const oscillation = Math.sin(slowProgress * Math.PI * 10) * (0.15 * (1 - slowProgress));
            
            // Calculate target velocity with oscillation
            const baseVelocity = MAX_VELOCITY * (1 - easeOutQuad(slowProgress));
            const targetVel = Math.max(MIN_VELOCITY * 3, baseVelocity * (1 + oscillation));
            
            // Smoothly approach target velocity
            velocityRef.current = lerp(velocityRef.current, targetVel, Math.min(1, deltaTime * 3));
        } 
        else {
            // Final approach phase (90-100%)
            const finalProgress = (progress - 0.9) / 0.1;
            
            // Subtle oscillation for final approach
            const oscillation = Math.sin(finalProgress * Math.PI * 5) * (0.05 * (1 - finalProgress));
            
            // Very slow final approach
            const baseVelocity = MIN_VELOCITY * 3 * (1 - easeOutQuad(finalProgress));
            const targetVel = Math.max(MIN_VELOCITY, baseVelocity * (1 + oscillation));
            
            velocityRef.current = lerp(velocityRef.current, targetVel, Math.min(1, deltaTime * 2));
        }
    };
    
    // Easing functions for smooth animation
    const easeInQuad = (t) => t * t;
    const easeOutQuad = (t) => t * (2 - t);
    const lerp = (a, b, t) => a + (b - a) * t;
    
    // Generate roulette items
    const items = [];
    for (let x = 0; x < 5; x++) {
        for (let i = 0; i < 220; i++) {
            if (i % 14 === 0) {
                items.push(<RouletteItem color="#00c74d" key={`${x}-${i}`} id={i}/>)
            } else if (i % 2 === 0) {
                items.push(<RouletteItem color="#31353d" key={`${x}-${i}`} id={i} />)
            } else {
                items.push(<RouletteItem color="#de4c41" key={`${x}-${i}`} id={i} />)
            }
        }
    }

    return (
        <animated.div style={{ marginLeft: marginLeft }}>
            {items.map((item) => (item))}
        </animated.div>
    );
}

export default RouletteStrip; 