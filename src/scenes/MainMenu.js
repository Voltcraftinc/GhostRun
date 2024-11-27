export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        console.log('Main Menu Scene');

        // Screen Center Coordinates
        const centerX = this.cameras.main.width / 2; // Horizontal center
        const centerY = this.cameras.main.height / 2; // Vertical center

        // Background Image (Full-Screen Background)
        this.add.image(centerX, centerY, 'title-bg');

        // Logo Positioned Above Buttons
        const logoY = centerY - 575; // Adjust the vertical position of the logo
        this.add.image(centerX, logoY, 'ghost-run-logo');

        // "Run" Button
        const runButtonY = centerY; // Vertical position for "Run" button
        const runButton = this.add.image(centerX, runButtonY, 'run')
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Game'); // Start the Game scene
            });

        // "Settings" Button
        const settingsButtonY = centerY + 300; // Space below "Run" button
        const settingsButton = this.add.image(centerX, settingsButtonY, 'settings')
            .setInteractive()
            .on('pointerdown', () => {
                console.log('Settings Clicked'); // Placeholder for Settings action
            });

        // Add Comments for Easy Editing
        // centerX: Keeps all elements horizontally centered
        // Adjust logoY, runButtonY, and settingsButtonY to change vertical positions
        // Add spacing between buttons by changing settingsButtonY relative to runButtonY
    }
}
