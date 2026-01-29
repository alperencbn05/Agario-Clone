import { CONFIG, GAME_STATE } from './constants.js';
import { makeRandomColor } from './utils.js';
import { Player } from './entities.js';
// Modüllerimizi import ediyoruz
import { state } from './state.js';
import { updatePhysics, splitPlayer } from './physics.js';
import { drawGame } from './renderer.js';

// UI Elementleri
const uiDiv = document.getElementById('uiContainer');
const startBtn = document.getElementById('startButton');
const nameInput = document.getElementById('playerNameInput');
const scoreBoard = document.getElementById('scoreBoard');

let animationId;

// --- EVENT LISTENERLAR ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (state.currentState === GAME_STATE.PLAYING) pauseGame();
        else if (state.currentState === GAME_STATE.PAUSED) resumeGame();
    }
    if (e.code === 'Space' && state.currentState === GAME_STATE.PLAYING) {
        splitPlayer();
    }
});

startBtn.addEventListener('click', startGame);

// --- OYUN KONTROLLERİ ---

function startGame() {
    const playerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Guest";

    // State Sıfırlama
    state.playerCells = [];
    state.bots = [];
    state.foods = [];
    state.totalBotsCreated = 0;
    state.score = 0;

    // İlk Oyuncuyu Yarat
    state.playerCells.push(new Player(
        state.canvas.width/2, 
        state.canvas.height/2, 
        CONFIG.PLAYER_START_RADIUS, 
        makeRandomColor(), 
        playerName
    ));

    state.currentState = GAME_STATE.PLAYING;
    uiDiv.style.display = 'none';
    
    cancelAnimationFrame(animationId);
    animate();
}

function pauseGame() {
    state.currentState = GAME_STATE.PAUSED;
    uiDiv.style.display = '';
    startBtn.innerText = "DEVAM ET";
    startBtn.onclick = resumeGame; // Buton fonksiyonunu değiştir
}

function resumeGame() {
    state.currentState = GAME_STATE.PLAYING;
    uiDiv.style.display = 'none';
    startBtn.onclick = startGame; // Geri al
    animate();
}

// --- ANA DÖNGÜ (GAME LOOP) ---

function animate() {
    if (state.currentState === GAME_STATE.PLAYING) {
        // 1. FİZİK HESAPLA
        updatePhysics();
        
        // 2. SKORU ARAYÜZE YAZ (Physics içinde hesaplandı)
        if (scoreBoard) scoreBoard.innerText = "Puan: " + state.score;
        
    } else if (state.currentState === GAME_STATE.GAME_OVER) {
        uiDiv.style.display = '';
        startBtn.innerText = "TEKRAR DENE";
        document.querySelector('#uiContainer p').innerText = "Yenildin! Skor: " + state.score;
        return; // Döngüyü durdur
    }

    // 3. ÇİZ
    drawGame();

    // Pause Ekranı Çizimi (Renderer dışında basitçe üstüne ekleyelim)
    if (state.currentState === GAME_STATE.PAUSED) {
        const ctx = state.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("DURAKLATILDI", state.canvas.width/2, state.canvas.height/2);
    }

    animationId = requestAnimationFrame(animate);
}