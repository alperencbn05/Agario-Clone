import { CONFIG } from './constants.js';
export function makeRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFFF33'];
    return colors[Math.floor(Math.random() * colors.length)];
}

export function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

export function drawGrid(ctx, mapSize) {
    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0'; // Çok açık gri
    ctx.lineWidth = 1;

    // Dikey Çizgiler
    for (let x = 0; x <= mapSize; x += 100) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mapSize);
    }
    // Yatay Çizgiler
    for (let y = 0; y <= mapSize; y += 100) {
        ctx.moveTo(0, y);
        ctx.lineTo(mapSize, y);
    }
    ctx.stroke();
    ctx.closePath();
}

export function getRandomPos() {
    return {
        x : Math.random() * CONFIG.MAP_SIZE,
        y : Math.random() * CONFIG.MAP_SIZE

}}