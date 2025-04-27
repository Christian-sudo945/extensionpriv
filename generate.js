const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#4285f4';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    const segments = 6;
    const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];
    
    for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.moveTo(size/2, size/2);
        ctx.arc(size/2, size/2, size/2 - size/10,
            (i * 2 * Math.PI) / segments,
            ((i + 1) * 2 * Math.PI) / segments);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = size/20;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(size/2, size/2, size/6, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = size/40;
    ctx.stroke();

    return canvas.toBuffer();
}

[48, 128].forEach(size => {
    const buffer = generateIcon(size);
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`Generated icon${size}.png`);
});