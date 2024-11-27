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
        this.lastMoveTime = 0; // Track time since last movement
        this.moveDelay = 200; // Delay (in milliseconds) between moves
        this.scrollSpeed = 5; // Parallax scrolling speed
    }

    create() {
        console.log('Game Scene');

        const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;

        // Dynamic adjustments based on device
        if (isMobile) {
            this.setupForMobile();
        } else {
            this.setupForDesktop();
        }

        // Pause Button
        this.pauseButton = this.add.image(this.cameras.main.width - 100, 100, 'pause')
            .setInteractive()
            .setScale(1)
            .setDepth(21);
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

        // Mobile Touch Controls
        if (isMobile) {
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

    update(time) {
        // Parallax Scrolling
        this.background.tilePositionY -= this.scrollSpeed;

        // Handle Keyboard Movement (Desktop Only)
        if (time > this.lastMoveTime + this.moveDelay) {
            if (this.cursors.left.isDown && this.currentColumnIndex > 0) {
                this.currentColumnIndex--;
                this.player.x = this.columns[this.currentColumnIndex];
                this.lastMoveTime = time;
            } else if (this.cursors.right.isDown && this.currentColumnIndex < this.columns.length - 1) {
                this.currentColumnIndex++;
                this.player.x = this.columns[this.currentColumnIndex];
                this.lastMoveTime = time;
            }

            if (this.cursors.up.isDown && this.currentRowIndex > 0) {
                this.currentRowIndex--;
                this.player.y = this.rows[this.currentRowIndex];
                this.lastMoveTime = time;
            } else if (this.cursors.down.isDown && this.currentRowIndex < this.rows.length - 1) {
                this.currentRowIndex++;
                this.player.y = this.rows[this.currentRowIndex];
                this.lastMoveTime = time;
            }
        }
    }

    setupForDesktop() {
        const screenWidth = 1080; // Base width for desktop
        const screenHeight = 1920; // Base height for desktop

        // Background Path for Desktop
        this.background = this.add.tileSprite(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 'path');

        // UI Elements
        this.add.image(540, 100, 'boobucks-game-amount').setScale(1.0).setDepth(20);
        this.boobucksText = this.add.text(540, 100, `${this.boobucksCollected}`, {
            fontSize: '50px',
            fill: '#fff',
        }).setOrigin(0.5).setDepth(21);

        const hpBar = this.add.image(540, 1820, 'ghostrun-hp-bar').setScale(1).setDepth(20);
        this.hpText = this.add.text(540, 1810, `${this.playerHP}`, {
            fontSize: '50px',
            fill: '#000000',
        }).setOrigin(0.5).setDepth(21);
    }

    setupForMobile() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
    
        // Dynamic column calculation for mobile
        this.columns = [
            screenWidth * 0.15,
            screenWidth * 0.35,
            screenWidth * 0.65,
            screenWidth * 0.85,
        ];
    
        // Ensure the path is centered and scaled properly
        this.background = this.add.tileSprite(
            screenWidth / 2, // Center horizontally
            screenHeight / 2, // Center vertically
            screenWidth, // Adjust width to fit screen
            screenHeight, // Adjust height to fit screen
            'path'
        );
    
        // UI Elements
        this.add.image(screenWidth / 2, 50, 'boobucks-game-amount').setScale(0.8).setDepth(20);
        this.boobucksText = this.add.text(screenWidth / 2, 50, `${this.boobucksCollected}`, {
            fontSize: '40px',
            fill: '#fff',
        }).setOrigin(0.5).setDepth(21);
    
        const hpBar = this.add.image(screenWidth / 2, screenHeight - 50, 'ghostrun-hp-bar').setScale(0.8).setDepth(20);
        this.hpText = this.add.text(screenWidth / 2, screenHeight - 50, `${this.playerHP}`, {
            fontSize: '40px',
            fill: '#000000',
        }).setOrigin(0.5).setDepth(21);
    }

    addTouchControls() {
        let isDragging = false; // To track if the ghost is being dragged
    
        this.input.on('pointerdown', (pointer) => {
            // Check if the pointer is touching the ghost
            const ghostBounds = this.player.getBounds();
            if (ghostBounds.contains(pointer.x, pointer.y)) {
                isDragging = true;
            }
        });
    
        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                // Only move the ghost when dragging
                const closestColumn = this.getClosestColumn(pointer.x);
                const closestRow = this.getClosestRow(pointer.y);
    
                this.player.x = closestColumn;
                this.player.y = closestRow;
            }
        });
    
        this.input.on('pointerup', () => {
            isDragging = false; // Stop dragging when the user lifts their finger
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
        const x = Phaser.Math.RND.pick(this.columns); // Random column
        const enemyType = Phaser.Math.RND.pick(['pumpkin-enemy', 'tombstone-enemy']); // Random enemy type
        const enemy = this.enemyGroup.create(x, 0, enemyType); // Create enemy at the top of the screen
        enemy.setVelocityY(this.speed);
        enemy.setScale(0.5); // Scale the enemy image
        enemy.setDepth(9); // Ensure the enemy is drawn under the UI elements
    
        // Adjust collider size and offset for smaller hitbox
        enemy.body.setSize(enemy.width * 0.7, enemy.height * 0.5); // 40% of original width and height
        enemy.body.setOffset(enemy.width * 0.15, enemy.height * 0.15); // Center the collider box
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
            this.playerHP = 100; // Reset HP for the next game
            this.currentColumnIndex = 1; // Reset to starting column
            this.currentRowIndex = this.rows.length - 1; // Reset to starting row
            this.player.setPosition(this.columns[this.currentColumnIndex], this.rows[this.currentRowIndex]); // Reset position
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
