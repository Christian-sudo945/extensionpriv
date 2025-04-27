const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#4285f4';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = size/10;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toBuffer();
}

[48, 128].forEach(size => {
    const buffer = generateIcon(size);
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`Generated icon${size}.png`);
});