import Phaser from 'phaser';
import { Boot } from '../scenes/Boot';
import { Preloader } from '../scenes/Preloader';
import { MainMenu } from '../scenes/MainMenu';
import { Game } from '../scenes/Game';

export function createGameConfig() {
    return {
        type: Phaser.AUTO,
        parent: 'app',
        width: 720,
        height: 1280,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [Boot, Preloader, MainMenu, Game]
    };
}