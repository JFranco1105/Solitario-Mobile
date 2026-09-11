import Phaser from 'phaser';
import { stats } from '../utils/stats';
import { showInterstitialAd } from '../admob.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const width = 720;
        const height = 1280;

        const bg = this.add.graphics();
        bg.fillStyle(0x0e5229, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(width / 2, 250, 'SOLITARIO', {
            fontSize: '64px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const games = stats.getGamesPlayed();
        const bestTimeSec = stats.getBestTime();
        const bestTimeStr = stats.formatTime(bestTimeSec);

        const statsBg = this.add.graphics();
        statsBg.fillStyle(0x064e3b, 0.8);
        statsBg.fillRoundedRect(width / 2 - 250, 420, 500, 200, 16);
        statsBg.lineStyle(2, 0x052e16, 1);
        statsBg.strokeRoundedRect(width / 2 - 250, 420, 500, 200, 16);

        this.add.text(width / 2, 470, `Partidas jugadas: ${games}`, {
            fontSize: '35px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 540, `Mejor tiempo: ${bestTimeStr}`, {
            fontSize: '35px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const btnW = 300;
        const btnH = 80;
        const btnX = width / 2;
        const btnY = 850;

        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(0x2563eb, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 20);

        this.add.text(btnX, btnY, 'Jugar', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const zone = this.add.zone(btnX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', async (pointer) => {
            if (pointer.button !== 0 && pointer.button !== undefined) return;

            // Comprobamos si las partidas jugadas son par (ej: cada 2 partidas)
            const games = stats.getGamesPlayed();
            if (games > 0 && games % 2 === 0) {
                await showInterstitialAd();
            }

            this.scene.start('Preloader');
        });
    }
}