export default class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        console.log('Boot Scene');
        this.load.image('logo', './public/assets/logo.png');
    }

    create() {
        // Global settings
        window.GAME_SETTINGS = { musicOn: true, sfxOn: true };

        // Try to lock orientation to portrait
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait-primary').catch(err => console.log(err));
        }

        this.scene.start('Preloader');
    }
}
