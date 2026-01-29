import { GAME_STATE } from './constants.js';

export const state = {
    canvas: document.getElementById("gameCanvas"),
    ctx: document.getElementById("gameCanvas").getContext("2d"),
    currentState: GAME_STATE.MENU,
    
    // Varlıklar
    playerCells: [], // Bizim parçalar
    bots: [],        // Botlar
    foods: [],       // Yemler
    
    // Kamera ve UI
    cameraZoom: 1,
    score: 0,        // Toplam skor burada tutulacak
    totalBotsCreated: 0,
    
    // Mouse konumu
    mouse: { x: 0, y: 0 }
};

// Mouse takibi (Global olduğu için burada kalabilir)
window.addEventListener('mousemove', (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
});

// Ekran boyutu takibi
window.addEventListener('resize', () => {
    state.canvas.width = window.innerWidth;
    state.canvas.height = window.innerHeight;
});
state.canvas.width = window.innerWidth;
state.canvas.height = window.innerHeight;