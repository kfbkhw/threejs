import { useRef, useEffect } from 'react';
import scene from './scene';

function App() {
    const initialized = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            scene(containerRef.current as HTMLDivElement);
        }
    }, []);

    return <div ref={containerRef}></div>;
}

export default App;
