export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.image(centerX, centerY, 'title-bg');
        const logoY = centerY - 575; 
        this.add.image(centerX, logoY, 'ghost-run-logo');

        const runButtonY = centerY;
        this.add.image(centerX, runButtonY, 'run')
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Game');
            });

        const settingsButtonY = centerY + 300;
        this.add.image(centerX, settingsButtonY, 'settings')
            .setInteractive()
            .on('pointerdown', () => {
                console.log('Settings Clicked');
            });
    }
}
