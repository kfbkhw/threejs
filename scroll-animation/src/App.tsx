import { useRef, useEffect } from 'react';
import scene from './scene';

function App() {
    const initialized = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            scene(canvasRef.current as HTMLCanvasElement);
        }
    }, []);

    return (
        <>
            <header>
                <h1>Three.js Scroll Animation</h1>
            </header>
            <canvas id="canvas" ref={canvasRef}></canvas>
        </>
    );
}

export default App;
