export default class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);

        this.add.text(centerX, centerY - 200, 'Paused', {
            fontSize: '64px',
            fill: '#fff',
        }).setOrigin(0.5);

        const resumeButton = this.add.text(centerX, centerY - 50, 'Resume', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        resumeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });

        const settingsButton = this.add.text(centerX, centerY + 50, 'Settings', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        settingsButton.on('pointerdown', () => {
            this.scene.launch('SettingsMenu', { returnTo: 'PauseMenu' });
            this.scene.bringToTop('SettingsMenu');
        });

        const exitButton = this.add.text(centerX, centerY + 150, 'Exit', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.start('MainMenu');
        });
    }
}
