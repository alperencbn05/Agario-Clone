import { CONFIG } from './constants.js';
import { state } from './state.js';
import { drawGrid } from './utils.js';

export function drawGame() {
    const ctx = state.ctx;
    const canvas = state.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Kamera Odaklanması
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(state.cameraZoom, state.cameraZoom);
    
    // Kamerayı en büyük parçaya odakla
    if (state.playerCells.length > 0) {
        // En büyük parça genelde listenin başındadır (Physics'te sort ediyoruz)
        const leader = state.playerCells[0]; 
        ctx.translate(-leader.x, -leader.y);
    }

    // Arkaplan ve Sınırlar
    drawGrid(ctx, CONFIG.MAP_SIZE);
    ctx.beginPath();
    ctx.lineWidth = CONFIG.BORDER_THICKNESS;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, CONFIG.MAP_SIZE, CONFIG.MAP_SIZE);

    // Çizim Sırası (Z-Index)
    const allEntities = [...state.foods, ...state.bots, ...state.playerCells];
    allEntities.sort((a, b) => a.radius - b.radius);

    allEntities.forEach(entity => entity.draw(ctx));

    ctx.restore();
}