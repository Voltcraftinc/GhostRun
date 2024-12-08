export default class SettingsMenu extends Phaser.Scene {
    constructor() {
        super('SettingsMenu');
    }

    create(data) {
        const returnTo = data?.returnTo || 'MainMenu'; // Default to 'MainMenu' if not specified
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);

        this.add.text(centerX, centerY - 200, 'Settings', {
            fontSize: '48px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Music Toggle
        const musicText = this.add.text(centerX, centerY - 50, `Music: ${window.GAME_SETTINGS.musicOn ? 'On' : 'Off'}`, {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        musicText.on('pointerdown', () => {
            window.GAME_SETTINGS.musicOn = !window.GAME_SETTINGS.musicOn;
            musicText.setText(`Music: ${window.GAME_SETTINGS.musicOn ? 'On' : 'Off'}`);
            this.updateAudioSettings();
        });

        // SFX Toggle
        const sfxText = this.add.text(centerX, centerY + 50, `Sound Effects: ${window.GAME_SETTINGS.sfxOn ? 'On' : 'Off'}`, {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        sfxText.on('pointerdown', () => {
            window.GAME_SETTINGS.sfxOn = !window.GAME_SETTINGS.sfxOn;
            sfxText.setText(`Sound Effects: ${window.GAME_SETTINGS.sfxOn ? 'On' : 'Off'}`);
        });

        // Return Button
        const returnButton = this.add.text(centerX, centerY + 200, 'Return', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();
        returnButton.on('pointerdown', () => {
            this.scene.stop(); // Stop the SettingsMenu scene
            this.scene.start(returnTo); // Start the specified scene (default to MainMenu)
        });
    }

    updateAudioSettings() {
        const gameScene = this.scene.get('Game');
        if (gameScene && gameScene.backgroundMusic) {
            if (window.GAME_SETTINGS.musicOn) {
                if (!gameScene.backgroundMusic.isPlaying) {
                    gameScene.backgroundMusic.play();
                }
            } else {
                gameScene.backgroundMusic.stop();
            }
        }
    }
}
