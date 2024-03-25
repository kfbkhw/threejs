import * as THREE from 'three';

interface CardProps {
    width: number;
    height: number;
    radius: number;
    color: number;
}

export default class Card {
    card: THREE.Mesh;

    constructor({ width, height, radius, color }: CardProps) {
        const x = width / 2 - radius;
        const y = height / 2 - radius;

        const shape = new THREE.Shape();
        shape
            .absarc(x, y, radius, Math.PI / 2, 0, true)
            .lineTo(x + radius, -y)
            .absarc(x, -y, radius, 0, -Math.PI / 2, true)
            .lineTo(-x, -y - radius)
            .absarc(-x, -y, radius, -Math.PI / 2, Math.PI, true)
            .lineTo(-x - radius, y)
            .absarc(-x, y, radius, Math.PI, Math.PI / 2, true);

        const extrudeSettings = {
            depth: 0.01,
            bevelThickness: 0.05,
            bevelSize: 0.01,
            bevelSegments: 5,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({
            color,
            side: THREE.DoubleSide,
            roughness: 0.5,
            metalness: 0.5,
        });

        this.card = new THREE.Mesh(geometry, material);
    }
}
