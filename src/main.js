import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import Preloader from './scenes/Preloader.js';
import MainMenu from './scenes/MainMenu.js';
import Game from './scenes/Game.js';
import GameOver from './scenes/GameOver.js';
import PauseMenu from './scenes/PauseMenu.js'; // Import PauseMenu

const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1920,
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT, // Ensures the game scales properly to fit the screen
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game on the screen
    },
    scene: [Boot, Preloader, MainMenu, Game, PauseMenu, GameOver], // Add PauseMenu here
};

const game = new Phaser.Game(config);
