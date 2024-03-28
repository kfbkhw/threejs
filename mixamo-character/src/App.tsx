import { useRef, useEffect, useState } from 'react';
import scene from './scene';

function App() {
    const initialized = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const onLoad = () => {
        const $loader = document.getElementById('loader') as HTMLDivElement;
        $loader.classList.add('fade-out');
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            scene(containerRef.current as HTMLDivElement, onLoad);
        }
    }, []);

    return (
        <>
            <div ref={containerRef}></div>
            <div className="animation-buttons">
                <div className="action-buttons" id="combat-action">
                    <h2></h2>
                </div>
                <div className="action-buttons" id="dance-action">
                    <h2></h2>
                </div>
            </div>
            {isLoading && (
                <div id="loader">
                    <label htmlFor="loading-progress">Loading...</label>
                    <progress
                        id="loading-progress"
                        max={1}
                        value={0}
                    ></progress>
                </div>
            )}
        </>
    );
}

export default App;
