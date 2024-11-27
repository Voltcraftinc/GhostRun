export default class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        console.log('Game Over Scene');
        this.add.text(540, 800, 'Game Over', {
            fontSize: '48px',
            fill: '#fff',
        }).setOrigin(0.5);

        this.add.text(540, 1000, 'Click to Return to Main Menu', {
            fontSize: '24px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
