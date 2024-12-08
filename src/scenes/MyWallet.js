export default class MyWallet extends Phaser.Scene {
    constructor() {
        super('MyWallet');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);

        this.add.text(centerX, centerY - 200, 'My Wallet', {
            fontSize: '48px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Assume boobucksCollected stored in local storage or just show a placeholder
        let boobucksAmount = 100; // If we had a global or from Game scene. For now let's just show a static or retrieve from localStorage if available.

        this.add.text(centerX, centerY - 100, `Boobucks: ${boobucksAmount}`, {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        const convertButton = this.add.text(centerX, centerY, 'Convert to Wavora', {
            fontSize: '32px', fill:'#fff'
        }).setOrigin(0.5).setInteractive();
        convertButton.on('pointerdown', () => {
            // Dummy action: Just show a message
            console.log("Converted to Wavora (stub)");
        });

        this.add.text(centerX, centerY+50, `Wavora: 0 (stub)`, { // Stub value
            fontSize:'32px', fill:'#fff'
        }).setOrigin(0.5);

        const cashoutButton = this.add.text(centerX, centerY+100, 'Cash Out', {
            fontSize:'32px', fill:'#fff'
        }).setOrigin(0.5).setInteractive();
        cashoutButton.on('pointerdown', () => {
            // Dummy action
            console.log("Cashed out (stub)");
        });

        const returnButton = this.add.text(centerX, centerY+200, 'Return', {
            fontSize:'32px', fill:'#fff'
        }).setOrigin(0.5).setInteractive();
        returnButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
