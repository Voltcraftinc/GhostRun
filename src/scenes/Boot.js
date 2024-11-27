export default class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        console.log('Boot Scene');
        this.load.image('logo', './public/assets/logo.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}
