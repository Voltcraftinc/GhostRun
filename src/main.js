import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import Preloader from './scenes/Preloader.js';
import MainMenu from './scenes/MainMenu.js';
import Game from './scenes/Game.js';
import PauseMenu from './scenes/PauseMenu.js';
import GameOver from './scenes/GameOver.js';
import SettingsMenu from './scenes/SettingsMenu.js';
import Leaderboard from './scenes/Leaderboard.js';
import MyWallet from './scenes/MyWallet.js';

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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, MainMenu, Leaderboard, MyWallet, SettingsMenu, Game, PauseMenu, GameOver],
};

new Phaser.Game(config);
