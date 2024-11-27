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

        // Left and Right Trees (One instance only)
        this.leftTree = this.add.tileSprite(0, 0, 0, 0, 'left-trees')
            .setOrigin(0, 0.5)
            .setDepth(11); // Above ghost and enemies
        this.rightTree = this.add.tileSprite(1080, 0, 0, 0, 'right-trees')
            .setOrigin(1, 0.5)
            .setDepth(11); // Above ghost and enemies

        // Boobucks Counter Background
        this.add.image(540, 100, 'boobucks-game-amount').setScale(1.0).setDepth(20);

        // UI Elements
        this.boobucksText = this.add.text(this.cameras.main.width / 2, 75, `${this.boobucksCollected}`, {
            fontSize: '50px',
            fill: '#fff',
        }).setOrigin(0.5, 0).setDepth(21);

        const hpBar = this.add.image(540, 1820, 'ghostrun-hp-bar').setScale(1).setDepth(20); // HP bar
        this.hpText = this.add.text(540, 1810, `${this.playerHP}`, {
            fontSize: '50px',
            fill: '#000000',
        }).setOrigin(0.5).setDepth(21);

        this.pauseButton = this.add.image(980, 100, 'pause').setInteractive().setScale(1).setDepth(21);
        this.pauseButton.on('pointerdown', this.pauseGame, this);

        // Player (Ghost)
        this.player = this.physics.add.sprite(
            this.columns[this.currentColumnIndex],
            this.rows[this.currentRowIndex],
            'ghost-main-character'
        ).setScale(0.5).setDepth(10); // Below trees
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

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
        this.leftTree.tilePositionY -= 5; // Moving left tree
        this.rightTree.tilePositionY -= 5; // Moving right tree

        // Player Horizontal Movement
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) && this.currentColumnIndex > 0) {
            this.currentColumnIndex--;
            this.player.x = this.columns[this.currentColumnIndex];
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.currentColumnIndex < this.columns.length - 1) {
            this.currentColumnIndex++;
            this.player.x = this.columns[this.currentColumnIndex];
        }

        // Player Vertical Movement
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.player.y = this.rows[this.currentRowIndex];
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.currentRowIndex < this.rows.length - 1) {
            this.currentRowIndex++;
            this.player.y = this.rows[this.currentRowIndex];
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.RND.pick(this.columns); // Random column
        const enemyType = Phaser.Math.RND.pick(['pumpkin-enemy', 'tombstone-enemy']);
        const enemy = this.enemyGroup.create(x, 0, enemyType); // Start at the top of the screen
        enemy.setVelocityY(this.speed);
        enemy.setScale(0.5);
        enemy.setDepth(9); // Enemy below the trees

        // Adjust collider size and offset
        enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.6); // 60% of original size
        enemy.body.setOffset(enemy.width * 0.2, enemy.height * 0.2); // Center the smaller collider
    }

    spawnBoobuck() {
        const x = Phaser.Math.RND.pick(this.columns); // Random column
        const boobuck = this.boobuckGroup.create(x, 0, 'boobuck'); // Start at the top of the screen
        boobuck.setVelocityY(this.speed);
        boobuck.setScale(0.5);
        boobuck.setDepth(9);
    }

    handlePlayerHit(player, enemy) {
        enemy.destroy(); // Remove the enemy on collision
        this.playerHP -= 25; // Reduce player HP
        this.hpText.setText(`HP: ${this.playerHP}`); // Update HP text
        if (this.playerHP <= 0) {
            console.log('Game Over');
            this.playerHP = 100; // Reset HP for new game
            this.scene.start('GameOver'); // Go to Game Over screen if HP is 0
        }
    }

    collectBoobuck(player, boobuck) {
        boobuck.destroy(); // Remove the Boobuck from the screen
        this.boobucksCollected++; // Increase the Boobucks counter
        this.boobucksText.setText(`Boobucks: ${this.boobucksCollected}`); // Update Boobucks text
    }

    pauseGame() {
        this.scene.pause(); // Pause the current scene
        this.scene.launch('PauseMenu'); // Launch the PauseMenu overlay
    }
}
