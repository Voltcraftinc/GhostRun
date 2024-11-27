export default class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        // Overlay and Pause Menu
        const overlay = this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.5);
        const pauseText = this.add.text(540, 800, 'Paused', {
            fontSize: '64px',
            fill: '#fff',
        }).setOrigin(0.5);

        const resumeButton = this.add.text(540, 900, 'Resume', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        resumeButton.on('pointerdown', () => {
            this.scene.stop(); // Stop PauseMenu scene
            this.scene.resume('Game'); // Resume the gameplay scene
        });

        const exitButton = this.add.text(540, 1100, 'Exit', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => {
            this.scene.stop('Game'); // Stop the gameplay scene
            this.scene.start('MainMenu'); // Go to the main menu
        });
    }
}
