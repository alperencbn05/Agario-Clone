export const CONFIG = {
    MAP_SIZE: 4000,
    FOOD_COUNT: 100,
    PLAYER_START_RADIUS: 15,
    ZOOM_SPEED: 0.05,
    BORDER_THICKNESS: 5,
    MIN_ZOOM: 0.05, // Yeni ayarın
    MAX_ZOOM: 1.0,
    BOT_COUNT: 20,       // Haritada kaç bot olsun?
    BOT_START_RADIUS: 15, // Botların boyutu
    BOT_SPEED: 2          // Botların hızı
};


export const GAME_STATE = {
    MENU: 'MENU',           // Henüz başlamadık
    PLAYING: 'PLAYING',     // Oynuyoruz
    PAUSED: 'PAUSED',       // Duraklattık
    GAME_OVER: 'GAME_OVER'  // Kaybettik
};