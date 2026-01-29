// entities.js
import { CONFIG } from './constants.js';

// --- 1. ANA SINIF (BABA) ---
export class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.markedForDeletion = false; // Silinmesi gerekiyor mu?
    }

    // Herkesin ortak çizim fonksiyonu
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// --- 2. YEMEK SINIFI (ÇOCUK) ---
export class Food extends Entity {
    constructor(x, y, radius, color) {
        super(x, y, radius, color); // Babasının (Entity) özelliklerini kur
    }

    // Yemekler belki ilerde altıgen olur? Şimdilik yuvarlak kalsın.
    // Farklılık olsun diye yemeklerin kenar çizgisi olmasın.
}

// --- 3. BOT SINIFI (ÇOCUK) ---
export class Bot extends Entity {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color);
        this.name = name;
        this.targetX = x; // İlk hedef doğduğu yer olsun
        this.targetY = y;
    }

    // Bot'un kendi beyni var! (Hareket Mantığı)
    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);

        // Hedefe vardıysa yeni hedef seç
        if (dist < 10) {
            this.targetX = Math.random() * CONFIG.MAP_SIZE;
            this.targetY = Math.random() * CONFIG.MAP_SIZE;
        } else {
            const speed = CONFIG.BOT_SPEED || 2;
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }

        // Duvarlara çarpmasın
        this.checkBoundaries();
    }

    checkBoundaries() {
        const offset = this.radius; // Kenar payı
        if (this.x < offset) this.x = offset;
        if (this.x > CONFIG.MAP_SIZE - offset) this.x = CONFIG.MAP_SIZE - offset;
        if (this.y < offset) this.y = offset;
        if (this.y > CONFIG.MAP_SIZE - offset) this.y = CONFIG.MAP_SIZE - offset;
    }

    // Bot çizimini ÖZELLEŞTİRİYORUZ (Override)
    draw(ctx) {
        // Önce babası gibi yuvarlağını çizsin
        super.draw(ctx); 

        // Sonra EKSTRA olarak ismini yazsın
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, this.y);

        // Farklı görünsün diye Botlara KIRMIZI bir kenarlık ekleyelim mi?
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'; // Yarı şeffaf kırmızı
        ctx.stroke();
    }
}

// --- 4. OYUNCU SINIFI (ÇOCUK) ---
// entities.js - Player Sınıfı

export class Player extends Entity {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color);
        this.name = name;
        this.score = 0;
        
        // --- YENİ FİZİK MOTORU ÖZELLİKLERİ ---
        this.vx = 0; // X eksenindeki fırlatma hızı
        this.vy = 0; // Y eksenindeki fırlatma hızı
        this.friction = 0.9; // Sürtünme (Her karede hızı %10 azaltır)
        // -------------------------------------

        this.recombineTimer = 0;
    }

    // Hareket fonksiyonunu baştan yazıyoruz
    // Artık hem Mouse'a gidiyor hem de fırlatma hızını (vx, vy) hesaba katıyor
    move(mouse, canvas, cameraZoom) {
        // 1. Mouse'a Doğru Normal Hareket (Eski Kod)
        const agility = Math.max(2 / this.radius, 0.02);
        const targetX = mouse.x - (canvas.width / 2);
        const targetY = mouse.y - (canvas.height / 2);
        
        // Mouse hareketi
        this.x += (targetX / cameraZoom) * agility;
        this.y += (targetY / cameraZoom) * agility;

        // 2. Fırlatma Etkisi (Velocity) - YENİ KISIM
        this.x += this.vx;
        this.y += this.vy;

        // 3. Sürtünme (Hız yavaşça sıfırlanır)
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Çok küçük hızları sıfırla ki işlemci yorulmasın
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;
    }
    
    // Draw fonksiyonu aynı kalabilir...
    draw(ctx) {
        super.draw(ctx);
        // ... (eski kodların)
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, this.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#333';
        ctx.stroke();
    }
}