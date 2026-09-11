import Phaser from 'phaser';
import { createGameConfig } from './game';
import { initAdMob } from './admob';

window.addEventListener('DOMContentLoaded', async () => {
  // 1. Inicializar AdMob
  await initAdMob();

  // 2. Arrancar Phaser Engine
  const config = createGameConfig();
  new Phaser.Game(config);
});