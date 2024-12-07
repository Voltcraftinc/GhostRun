export default class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);

        this.add.text(centerX, centerY - 100, 'Paused', {
            fontSize: '64px',
            fill: '#fff',
        }).setOrigin(0.5);

        const resumeButton = this.add.text(centerX, centerY, 'Resume', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        resumeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });

        const exitButton = this.add.text(centerX, centerY + 200, 'Exit', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.start('MainMenu');
        });
    }
}
