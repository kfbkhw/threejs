import { useRef, useEffect, useState } from 'react';
import scene from './scene';
import { CARD_COLORS } from './colors';
import { MeshStandardMaterial, Color } from 'three';

function App() {
    const initialized = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<MeshStandardMaterial>();
    const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            cardRef.current = scene(containerRef.current as HTMLDivElement);
        }
    }, []);

    useEffect(() => {
        const buttons =
            document.querySelectorAll<HTMLButtonElement>('.color-button');
        buttons.forEach((button) => {
            if (button.style.backgroundColor === selectedColor) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
        const card = cardRef.current as MeshStandardMaterial;
        card.color = new Color(selectedColor);
    }, [selectedColor]);

    return (
        <>
            <div ref={containerRef}></div>
            <div className="color-buttons">
                {CARD_COLORS.map((color) => (
                    <button
                        className="color-button"
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                    ></button>
                ))}
            </div>
        </>
    );
}

export default App;
