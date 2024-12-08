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
        this.load.image('mywallet', 'assets/mywallet.png');
        this.load.image('leaderboard', 'assets/leaderboard.png');

        // Gameplay assets
        this.load.image('path', 'assets/path.png');
        this.load.image('ghost-main-character', 'assets/ghost-main-character.png');
        this.load.image('pumpkin-enemy', 'assets/pumpkin-enemy.png');
        this.load.image('tombstone-enemy', 'assets/tombstone-enemy.png');
        this.load.image('boobuck', 'assets/boobuck.png');
        this.load.image('ghost-life', 'assets/ghost-life.png');
        this.load.image('crate', 'assets/crate.png');

        // Boost assets
        this.load.image('boost-crate', 'assets/boost-crate.png');
        this.load.image('boost-box', 'assets/boost-box.png');
        this.load.image('invincibility-mode', 'assets/invincibility-mode.png');
        this.load.image('magnet-boost', 'assets/magnet-boost.png');
        this.load.image('enemy-speed-up', 'assets/enemy-speed-up.png');
        this.load.image('10-boobucks', 'assets/boobuck.png');

        // UI assets
        this.load.image('boobucks-game-amount', 'assets/boobucks-game-amount.png');
        this.load.image('pause', 'assets/pause.png');
        this.load.image('ghostrun-hp-bar', 'assets/ghostrun-hp-bar.png');
        this.load.image('distance-box', 'assets/distance-box.png');
        this.load.image('distance-best-box', 'assets/distance-best-box.png');

        // Audio
        this.load.audio('phantom-midnight', 'assets/phantom-midnight.mp3');
        this.load.audio('life_collect', 'assets/life_collect.wav');
        this.load.audio('hit_damage', 'assets/hit_damage.wav');
        this.load.audio('boost_sound', 'assets/boost_sound.wav');
        this.load.audio('coin_collect', 'assets/coin_collect.wav');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
