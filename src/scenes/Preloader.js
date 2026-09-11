import Phaser from 'phaser';

const SUITS = ['♥', '♦', '♣', '♠'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const V_WIDTH = 720;
        const V_HEIGHT = 1280;

        const bg = this.add.graphics();
        bg.fillStyle(0x0e5229, 1);
        bg.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        this.add.text(V_WIDTH / 2, V_HEIGHT / 2 - 30, 'Creando partida', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(V_WIDTH / 2, V_HEIGHT / 2 + 30, 'Cargando...', {
            fontSize: '24px',
            color: '#fbbf24'
        }).setOrigin(0.5);
    }

    create() {
        this.createCardTextures();
        this.scene.start('Game');
    }

    createCardTextures() {
        if (this.textures.exists('card_back')) return;

        const cardWidth = 88;
        const cardHeight = 128;

        const backGfx = this.make.graphics({ add: false });
        backGfx.fillStyle(0x1e3a8a);
        backGfx.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
        backGfx.lineStyle(3, 0x3b82f6);
        backGfx.strokeRoundedRect(3, 3, cardWidth - 6, cardHeight - 6, 6);
        backGfx.generateTexture('card_back', cardWidth, cardHeight);
        backGfx.destroy();

        const slotGfx = this.make.graphics({ add: false });
        slotGfx.lineStyle(2, 0x15803d, 0.7);
        slotGfx.fillStyle(0x052e16, 0.4);
        slotGfx.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
        slotGfx.strokeRoundedRect(0, 0, cardWidth, cardHeight, 8);
        slotGfx.generateTexture('card_slot', cardWidth, cardHeight);
        slotGfx.destroy();

        SUITS.forEach(suit => {
            const isRed = suit === '♥' || suit === '♦';
            const colorStr = isRed ? '#dc2626' : '#111827';

            VALUES.forEach((valStr) => {
                const key = `card_${suit}_${valStr}`;
                if (this.textures.exists(key)) return;

                const canvasTexture = this.textures.createCanvas(key, cardWidth, cardHeight);
                const ctx = canvasTexture.context;

                ctx.fillStyle = '#ffffff';
                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(0, 0, cardWidth, cardHeight, 8);
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#d1d5db';
                    ctx.stroke();
                } else {
                    ctx.fillRect(0, 0, cardWidth, cardHeight);
                }

                ctx.fillStyle = colorStr;
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(valStr, 8, 6);
                ctx.fillText(suit, 8, 26);

                ctx.font = '36px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(suit, cardWidth / 2, cardHeight / 2 + 6);

                canvasTexture.refresh();
            });
        });
    }
}