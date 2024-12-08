export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Background and logo
        this.add.image(centerX, centerY, 'title-bg');
        const logoY = centerY - 575; 
        this.add.image(centerX, logoY, 'ghost-run-logo');

        // Button configuration
        const buttonSpacing = 200; // Adjusted distance between buttons
        const buttonScale = 0.8; // Scale for all buttons (can be adjusted)
        const buttons = [
            { key: 'run', callback: () => this.scene.start('Game') },
            { key: 'mywallet', callback: () => this.scene.start('MyWallet') },
            { key: 'leaderboard', callback: () => this.scene.start('Leaderboard') },
            { key: 'settings', callback: () => this.scene.start('SettingsMenu') },
        ];

        // Start the buttons below the logo
        let currentY = centerY - 100;

        // Position buttons dynamically
        buttons.forEach((button, index) => {
            const buttonY = currentY + index * buttonSpacing; // Adjust Y based on index and spacing
            const btn = this.add.image(centerX, buttonY, button.key)
                .setInteractive()
                .setScale(buttonScale); // Apply scaling
            btn.on('pointerdown', button.callback);
        });

        // Debug comment for flexibility:
        // You can adjust `buttonSpacing` to change the distance between buttons
        // You can adjust `buttonScale` to resize all buttons
        // The order and number of buttons can be changed by modifying the `buttons` array
    }
}
