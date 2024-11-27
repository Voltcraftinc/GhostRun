import PauseMenu from './PauseMenu'; // Import the PauseMenu scene

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.columns = [150, 417, 684, 950]; // Define column positions (x-axis)
        this.rows = [200, 400, 600, 800, 1000, 1200, 1400, 1600]; // Define row positions (y-axis)
        this.currentColumnIndex = 1; // Start in the second column
        this.currentRowIndex = this.rows.length - 1; // Start in the bottom row
        this.playerHP = 100; // Player's initial health
        this.boobucksCollected = 0; // Boobucks counter
    }

    create() {
        console.log('Game Scene');

        // Background Path
        this.background = this.add.tileSprite(540, 960, 1080, 1920, 'path');

        // Left and Right Trees
        this.leftTree = this.add.tileSprite(0, 0, 0, 0, 'left-trees')
            .setOrigin(0, 0.5)
            .setDepth(11);
        this.rightTree = this.add.tileSprite(1080, 0, 0, 0, 'right-trees')
            .setOrigin(1, 0.5)
            .setDepth(11);

        // UI Elements
        this.add.image(540, 100, 'boobucks-game-amount').setScale(1.0).setDepth(20);

        this.boobucksText = this.add.text(this.cameras.main.width / 2, 75, `${this.boobucksCollected}`, {
            fontSize: '50px',
            fill: '#fff',
        }).setOrigin(0.5, 0).setDepth(21);

        const hpBar = this.add.image(540, 1820, 'ghostrun-hp-bar').setScale(1).setDepth(20);
        this.hpText = this.add.text(540, 1810, `${this.playerHP}`, {
            fontSize: '50px',
            fill: '#000000',
        }).setOrigin(0.5).setDepth(21);

        // Pause Button
        this.pauseButton = this.add.image(980, 100, 'pause').setInteractive().setScale(1).setDepth(21);
        this.pauseButton.on('pointerdown', this.pauseGame, this);

        // Player (Ghost)
        this.player = this.physics.add.sprite(
            this.columns[this.currentColumnIndex],
            this.rows[this.currentRowIndex],
            'ghost-main-character'
        ).setScale(0.5).setDepth(10);
        this.player.setCollideWorldBounds(true);

        // Input Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Enable Touch Controls on Mobile
        if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
            this.addTouchControls();
        }

        // Enemies and Collectibles Groups
        this.enemyGroup = this.physics.add.group();
        this.boobuckGroup = this.physics.add.group();

        // Spawn Enemies
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        // Spawn Boobucks
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnBoobuck,
            callbackScope: this,
            loop: true,
        });

        // Collisions
        this.physics.add.overlap(this.player, this.enemyGroup, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.player, this.boobuckGroup, this.collectBoobuck, null, this);

        // Initial Speed for Enemies and Boobucks
        this.speed = 200;
    }

    update() {
        // Parallax Scrolling
        this.background.tilePositionY -= 5;
        this.leftTree.tilePositionY -= 5;
        this.rightTree.tilePositionY -= 5;

        // Player Keyboard Movement (for PC)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) && this.currentColumnIndex > 0) {
            this.currentColumnIndex--;
            this.player.x = this.columns[this.currentColumnIndex];
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.currentColumnIndex < this.columns.length - 1) {
            this.currentColumnIndex++;
            this.player.x = this.columns[this.currentColumnIndex];
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.player.y = this.rows[this.currentRowIndex];
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.currentRowIndex < this.rows.length - 1) {
            this.currentRowIndex++;
            this.player.y = this.rows[this.currentRowIndex];
        }
    }

    addTouchControls() {
        // Enable Drag Movement for Mobile
        this.input.on('pointermove', (pointer) => {
            const closestColumn = this.getClosestColumn(pointer.x);
            const closestRow = this.getClosestRow(pointer.y);

            this.player.x = closestColumn;
            this.player.y = closestRow;
        });
    }

    getClosestColumn(pointerX) {
        return this.columns.reduce((closest, column) => (
            Math.abs(column - pointerX) < Math.abs(closest - pointerX) ? column : closest
        ));
    }

    getClosestRow(pointerY) {
        return this.rows.reduce((closest, row) => (
            Math.abs(row - pointerY) < Math.abs(closest - pointerY) ? row : closest
        ));
    }

    spawnEnemy() {
        const x = Phaser.Math.RND.pick(this.columns);
        const enemyType = Phaser.Math.RND.pick(['pumpkin-enemy', 'tombstone-enemy']);
        const enemy = this.enemyGroup.create(x, 0, enemyType);
        enemy.setVelocityY(this.speed);
        enemy.setScale(0.5);
        enemy.setDepth(9);
    }

    spawnBoobuck() {
        const x = Phaser.Math.RND.pick(this.columns);
        const boobuck = this.boobuckGroup.create(x, 0, 'boobuck');
        boobuck.setVelocityY(this.speed);
        boobuck.setScale(0.5);
        boobuck.setDepth(9);
    }

    handlePlayerHit(player, enemy) {
        enemy.destroy();
        this.playerHP -= 25;
        this.hpText.setText(`${this.playerHP}`);
        if (this.playerHP <= 0) {
            console.log('Game Over');
            this.scene.start('GameOver');
        }
    }

    collectBoobuck(player, boobuck) {
        boobuck.destroy();
        this.boobucksCollected++;
        this.boobucksText.setText(`${this.boobucksCollected}`);
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseMenu');
    }
}
