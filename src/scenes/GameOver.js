export default class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 100, 'Game Over', {
            fontSize: '48px',
            fill: '#fff',
        }).setOrigin(0.5);

        this.add.text(centerX, centerY, 'Click to Return to Main Menu', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
