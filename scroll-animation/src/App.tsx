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
            <canvas id="canvas" ref={canvasRef}></canvas>
            <h1 className="title">Three.js Scroll Animation</h1>
            <div className="scroll"></div>
        </>
    );
}

export default App;
