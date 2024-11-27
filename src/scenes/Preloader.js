export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        console.log('Preloader Scene');
        
        // Title screen assets
        this.load.image('title-bg', 'assets/title-bg.png');
        this.load.image('ghost-run-logo', 'assets/ghost-run-logo.png');
        this.load.image('run', 'assets/run.png');
        this.load.image('settings', 'assets/settings.png');

        // Gameplay assets
        this.load.image('path', 'assets/path.png'); // Background path
        this.load.image('ghost-main-character', 'assets/ghost-main-character.png'); // Player character
        this.load.image('pumpkin-enemy', 'assets/pumpkin-enemy.png'); // Enemy 1
        this.load.image('tombstone-enemy', 'assets/tombstone-enemy.png'); // Enemy 2
        this.load.image('boobuck', 'assets/boobuck.png'); // Collectible currency
        this.load.image('left-trees', 'assets/left-trees.png'); // Left side decoration
        this.load.image('right-trees', 'assets/right-trees.png'); // Right side decoration

        // UI assets
        this.load.image('boobucks-game-amount', 'assets/boobucks-game-amount.png');
        this.load.image('boost', 'assets/boost.png');
        this.load.image('pause', 'assets/pause.png');
        this.load.image('ghostrun-hp-bar', 'assets/ghostrun-hp-bar.png');
    }

    create() {
        this.scene.start('MainMenu'); // Start the Main Menu after preloading
    }
}
