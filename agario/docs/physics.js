import { CONFIG, GAME_STATE } from './constants.js';
import { state } from './state.js';
import { Player, Bot, Food } from './entities.js';
import { getRandomPos, makeRandomColor } from './utils.js';

// --- ANA FİZİK DÖNGÜSÜ ---
export function updatePhysics() {
    // 1. Oyuncu Hareketi ve Duvarlar
    state.playerCells.forEach(cell => {
        cell.move(state.mouse, state.canvas, state.cameraZoom);
        checkBoundaries(cell);
    });

    // 2. Fizik Motoru (İtme/Birleşme)
    handlePlayerCellPhysics();

    // 3. Bot Hareketi
    state.bots.forEach(bot => bot.update());

    // 4. Çarpışmalar
    checkAllCollisions();

    // 5. Spawn (Doğum) Kontrolleri
    if (state.foods.length < CONFIG.FOOD_COUNT) spawnFoods(5);
    if (state.bots.length < CONFIG.BOT_COUNT) spawnBots(1);

    // 6. ZOOM ve SKOR GÜNCELLEME
    updateZoomAndScore();
}

// --- BÖLÜNME (SPLIT) ---
export function splitPlayer() {
    // Tersten döngü (Listeye ekleme yapacağız)
    for (let i = state.playerCells.length - 1; i >= 0; i--) {
        const cell = state.playerCells[i];
        
        if (cell.radius < 30) continue;
        if (state.playerCells.length >= 16) break;

        const newRadius = cell.radius / Math.sqrt(2);
        cell.radius = newRadius;
        cell.recombineTimer = 30 * 60;

        // Mouse yönüne fırlat
        const dx = state.mouse.x - (state.canvas.width / 2);
        const dy = state.mouse.y - (state.canvas.height / 2);
        const dist = Math.hypot(dx, dy);

        const offset = newRadius * 1.5;
        const newCell = new Player(
            cell.x + (dx / dist) * offset,
            cell.y + (dy / dist) * offset,
            newRadius,
            cell.color,
            cell.name
        );

        newCell.vx = (dx / dist) * 20; // Hız
        newCell.vy = (dy / dist) * 20;
        newCell.recombineTimer = 30 * 60;

        state.playerCells.push(newCell);
    }
}

// --- YARDIMCI FONKSİYONLAR ---

function updateZoomAndScore() {
    if (state.playerCells.length === 0) return;

    // En büyük parçayı bul (Kamera için)
    state.playerCells.sort((a, b) => b.radius - a.radius);
    const biggestCell = state.playerCells[0];

    // Zoom Ayarı
    let ratio = CONFIG.PLAYER_START_RADIUS / biggestCell.radius;
    let targetZoom = Math.pow(ratio, 0.1);
    targetZoom = Math.max(targetZoom, CONFIG.MIN_ZOOM);
    targetZoom = Math.min(targetZoom, CONFIG.MAX_ZOOM);
    state.cameraZoom += (targetZoom - state.cameraZoom) * CONFIG.ZOOM_SPEED;

    // SKOR HESAPLAMA (TÜM PARÇALARIN TOPLAMI) - Score Fix Burada!
    let totalScore = 0;
    state.playerCells.forEach(cell => {
        totalScore += Math.floor(cell.radius);
    });
    state.score = totalScore;
}

function handlePlayerCellPhysics() {
    // Ağırlık Merkezi
    let centerX = 0, centerY = 0;
    state.playerCells.forEach(c => { centerX += c.x; centerY += c.y; });
    if(state.playerCells.length > 0) { centerX /= state.playerCells.length; centerY /= state.playerCells.length; }

    for (let i = 0; i < state.playerCells.length; i++) {
        const cellA = state.playerCells[i];
        
        // Merkeze Çekim (Gravity)
        const distToCenter = Math.hypot(centerX - cellA.x, centerY - cellA.y);
        if (distToCenter > cellA.radius * 8) {
            cellA.x += (centerX - cellA.x) * 0.01;
            cellA.y += (centerY - cellA.y) * 0.01;
        }

        if (cellA.recombineTimer > 0) cellA.recombineTimer--;

        for (let j = i + 1; j < state.playerCells.length; j++) {
            const cellB = state.playerCells[j];
            const dx = cellB.x - cellA.x;
            const dy = cellB.y - cellA.y;
            const dist = Math.hypot(dx, dy);

            if (dist < cellA.radius + cellB.radius) {
                // Birleşme
                if (cellA.recombineTimer <= 0 && cellB.recombineTimer <= 0) {
                    cellA.radius = Math.sqrt(cellA.radius * cellA.radius + cellB.radius * cellB.radius);
                    cellB.markedForDeletion = true;
                    continue;
                }
                // İtme
                const overlap = (cellA.radius + cellB.radius) - dist;
                if (overlap > 0 && dist > 0) {
                    const pushX = (dx / dist) * overlap * 0.1;
                    const pushY = (dy / dist) * overlap * 0.1;
                    cellA.x -= pushX; cellA.y -= pushY;
                    cellB.x += pushX; cellB.y += pushY;
                }
            }
        }
    }
    // Temizlik
    for (let i = state.playerCells.length - 1; i >= 0; i--) {
        if (state.playerCells[i].markedForDeletion) state.playerCells.splice(i, 1);
    }
}

function checkAllCollisions() {
    // 1. Oyuncu vs Yemek
    state.playerCells.forEach(cell => {
        for (let i = state.foods.length - 1; i >= 0; i--) {
            const food = state.foods[i];
            const dist = Math.hypot(cell.x - food.x, cell.y - food.y);
            if (dist < cell.radius + food.radius) {
                cell.radius += food.radius * 0.1;
                state.foods.splice(i, 1);
            }
        }
    });

    // 2. Oyuncu vs Bot
    for (let idx = state.playerCells.length - 1; idx >= 0; idx--) {
        const cell = state.playerCells[idx];

        for (let i = state.bots.length - 1; i >= 0; i--) {
            const bot = state.bots[i];
            const dist = Math.hypot(cell.x - bot.x, cell.y - bot.y);
            
            if (dist < cell.radius + bot.radius) {
                
                // A) BİZ YİYORUZ (Bot Küçücük kaldı)
                if (cell.radius > bot.radius * 1.1 && dist < cell.radius - bot.radius * 0.5) {
                    cell.radius += bot.radius * 0.25; // Biz büyüyoruz
                    state.bots.splice(i, 1); // Bot ölüyor
                    spawnBots(1); // Yeni bot doğuyor
                } 
                
                // B) YENİLİYORUZ (Bot bizi hüpletiyor)
                else if (bot.radius > cell.radius * 1.1 && dist < bot.radius - cell.radius * 0.5) {
                    
                    // --- İŞTE EKSİK OLAN SATIR BURASIYDI! ---
                    bot.radius += cell.radius * 0.25; // Bot artık büyüyor!
                    // ---------------------------------------

                    state.playerCells.splice(idx, 1); // Bizim parça siliniyor
                    
                    // Eğer hiç parçamız kalmadıysa oyun biter
                    if (state.playerCells.length === 0) endGameLogic();
                    
                    // Parçamız yendiği için bu döngüden çıkalım (Hata almamak için)
                    break; 
                }
            }
        }
    }

    // 3. Bot vs Bot (Basitleştirilmiş)
    for (let i = 0; i < state.bots.length; i++) {
        for (let j = i + 1; j < state.bots.length; j++) {
            const botA = state.bots[i];
            const botB = state.bots[j];
            if(botA.mark || botB.mark) continue;
            
            const dist = Math.hypot(botA.x - botB.x, botA.y - botB.y);
            if(dist < botA.radius + botB.radius){
                if(botA.radius > botB.radius * 1.1) { botA.radius += botB.radius*0.25; botB.mark = true; }
                else if(botB.radius > botA.radius * 1.1) { botB.radius += botA.radius*0.25; botA.mark = true; }
            }
        }
    }
    for(let i=state.bots.length-1; i>=0; i--) if(state.bots[i].mark) state.bots.splice(i,1);
}

function checkBoundaries(cell) {
    const r = cell.radius;
    if (cell.x < r) cell.x = r;
    if (cell.x > CONFIG.MAP_SIZE - r) cell.x = CONFIG.MAP_SIZE - r;
    if (cell.y < r) cell.y = r;
    if (cell.y > CONFIG.MAP_SIZE - r) cell.y = CONFIG.MAP_SIZE - r;
}

// Spawn Yardımcıları
function spawnFoods(n) {
    for(let i=0; i<n; i++) state.foods.push(new Food(getRandomPos().x, getRandomPos().y, 5+Math.random()*5, makeRandomColor()));
}
function spawnBots(n) {
    for(let i=0; i<n; i++) {
        state.totalBotsCreated++;
        state.bots.push(new Bot(getRandomPos().x, getRandomPos().y, CONFIG.BOT_START_RADIUS+Math.random()*20, makeRandomColor(), "Bot "+state.totalBotsCreated));
    }
}
function endGameLogic() {
    state.currentState = GAME_STATE.GAME_OVER;
}