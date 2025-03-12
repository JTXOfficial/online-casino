import React, { memo, useEffect, useRef, useState, useCallback } from 'react'

const Countdown = memo(function Countdown({ time }) {
    console.log("Countdown component received time:", time);
    const [initialTime, setInitialTime] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const prevTimeRef = useRef(time);
    const startTimeRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [displayTime, setDisplayTime] = useState(time);
    const [progressWidth, setProgressWidth] = useState('100%');
    const timeRef = useRef(time);

    // Update the ref whenever time changes
    useEffect(() => {
        timeRef.current = time;
    }, [time]);

    const clock = {
        color: 'white',
        fontSize: '2rem',
        display: 'block',
        lineHeight: 1.1,
        position: 'relative',
        top: '30px',
        fontWeight: 'bold',
        marginBottom: '40px'
    }

    // Determine if we're in countdown mode or rolling mode
    const isCountingDown = time > 0;
    
    // Memoize the animation function to prevent recreating it on each render
    const animate = useCallback(() => {
        if (!isAnimating) return;
        
        const now = Date.now();
        const elapsedSeconds = (now - startTimeRef.current) / 1000;
        const remainingTime = Math.max(0, initialTime - elapsedSeconds);
        
        // Update display time (rounded up for better UX)
        const roundedTime = Math.ceil(remainingTime);
        setDisplayTime(roundedTime);
        
        // Update progress width - use precise remaining time for smooth animation
        const progress = (remainingTime / initialTime) * 100;
        setProgressWidth(`${Math.max(0, progress)}%`);
        
        // Continue animation if there's time remaining
        if (remainingTime > 0) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            // Time has expired
            setIsAnimating(false);
            setDisplayTime(0);
            setProgressWidth('0%');
        }
    }, [isAnimating, initialTime]);
    
    // Animation loop using requestAnimationFrame
    const startAnimationLoop = useCallback(() => {
        // Cancel any existing animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        
        // Start the animation loop
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [animate]);
    
    // Handle visibility change (tab switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab is hidden, pause animation
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            } else if (isAnimating && initialTime) {
                // Tab is visible again, recalculate elapsed time and restart animation
                const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const remainingTime = Math.max(0, initialTime - elapsedSeconds);
                
                if (remainingTime > 0) {
                    // Only restart if there's time remaining
                    setDisplayTime(remainingTime);
                    startAnimationLoop();
                } else {
                    // Time has expired while tab was hidden
                    setIsAnimating(false);
                    setDisplayTime(0);
                    setProgressWidth('0%');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAnimating, initialTime, startAnimationLoop]);
    
    // Reset animation when time changes
    useEffect(() => {
        console.log("Time changed to:", time, "Previous time was:", prevTimeRef.current);
        
        // If time increased or went from 0 to a positive number, it's a new countdown
        if (time > prevTimeRef.current || (prevTimeRef.current === 0 && time > 0)) {
            console.log("New countdown started with time:", time);
            setInitialTime(time);
            setDisplayTime(time);
            setProgressWidth('100%');
            setIsAnimating(true);
            startTimeRef.current = Date.now();
            
            // Start animation loop
            startAnimationLoop();
        }
        
        // If time went to 0, stop animating
        if (time === 0 && prevTimeRef.current > 0) {
            console.log("Countdown reached zero, stopping animation");
            setIsAnimating(false);
            setDisplayTime(0);
            setProgressWidth('0%');
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
        
        // Always update the previous time reference
        prevTimeRef.current = time;
    }, [time, startAnimationLoop]);
    
    // Clean up animation on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    // Force a re-render every 100ms to ensure smooth updates
    useEffect(() => {
        if (!isAnimating) return;
        
        const interval = setInterval(() => {
            // This forces a re-render by updating a state value
            setDisplayTime(prevTime => {
                const now = Date.now();
                const elapsedSeconds = (now - startTimeRef.current) / 1000;
                const remainingTime = Math.max(0, initialTime - elapsedSeconds);
                return Math.ceil(remainingTime);
            });
            
            // Update progress width
            setProgressWidth(prev => {
                const now = Date.now();
                const elapsedSeconds = (now - startTimeRef.current) / 1000;
                const remainingTime = Math.max(0, initialTime - elapsedSeconds);
                const progress = (remainingTime / initialTime) * 100;
                return `${Math.max(0, progress)}%`;
            });
        }, 100);
        
        return () => clearInterval(interval);
    }, [isAnimating, initialTime]);

    return (
        <div>
            <div style={{marginBottom: '20px', textAlign: 'center'}}> 
                <div style={clock}>
                    {isCountingDown 
                        ? Math.ceil(displayTime).toString()
                        : 'Rolling...'}
                </div>
                {isCountingDown && (
                    <div 
                        style={{
                            width: progressWidth,
                            background: '#00c74d', 
                            height: '40px', 
                            borderRadius: '5px',
                            transition: 'width 0.1s linear'
                        }}
                    />
                )}
            </div>
        </div>
    );
});

export default Countdown;