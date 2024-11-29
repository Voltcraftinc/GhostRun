import PauseMenu from './PauseMenu'; // Import the PauseMenu scene

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.columns = [150, 417, 684, 950]; // Define column positions (x-axis)
        this.rows = [200, 400, 600, 800, 1000, 1200, 1400, 1600]; // Define row positions (y-axis)
        this.currentColumnIndex = 1; // Start in the second column
        this.currentRowIndex = this.rows.length - 1; // Start in the bottom row
        this.lives = 4; // Player starts with 4 lives
        this.boobucksCollected = 0; // Boobucks counter
        this.lastMoveTime = 0; // Track time since last movement
        this.moveDelay = 200; // Delay (in milliseconds) between moves
        this.scrollSpeed = 5; // Parallax scrolling speed
        this.speed = 200; // Speed for falling objects
        this.activeBoost = null; // Active boost or effect
        this.musicPlaying = false; // Flag to check if music is already playing
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
        this.pauseButton = this.add.image(this.cameras.main.width - 100, 50, 'pause')
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

        // Lives Display
        this.livesGroup = this.add.group();
        this.hpBar = this.add.image(this.cameras.main.width / 2, this.cameras.main.height - 50, 'ghostrun-hp-bar')
            .setScale(1)
            .setDepth(20);
        this.updateLivesDisplay();

        // Boobucks Display
        this.boobucksImage = this.add.image(this.cameras.main.width / 2, 50, 'boobucks-game-amount')
            .setScale(1)
            .setDepth(20);
        this.boobucksText = this.add.text(this.cameras.main.width / 2, 50, `${this.boobucksCollected}`, {
            fontSize: '40px',
            fill: '#fff',
        }).setOrigin(0.5).setDepth(21);

        // Boost Display Area (Top-Left Corner)
        this.boostDisplay = this.add.image(100, 50, 'boost-crate').setScale(0.5).setDepth(21);

        // Background Music
        if (!this.musicPlaying) {
            this.backgroundMusic = this.sound.add('phantom-midnight', { loop: true });
            this.backgroundMusic.play();
            this.musicPlaying = true;
        }

        // Input Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Mobile Touch Controls
        if (isMobile) {
            this.addTouchControls();
        }

        // Enemies and Collectibles Groups
        this.enemyGroup = this.physics.add.group();
        this.boobuckGroup = this.physics.add.group();
        this.lifeGroup = this.physics.add.group();
        this.boostCrateGroup = this.physics.add.group();

        // Spawn Enemies
        this.enemySpawnTimer = this.time.addEvent({
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

        // Spawn Lives
        this.time.addEvent({
            delay: 15000, // Rare spawn
            callback: this.spawnLife,
            callbackScope: this,
            loop: true,
        });

        // Spawn Boost Crates
        this.time.addEvent({
            delay: 20000, // Rare spawn
            callback: this.spawnBoostCrate,
            callbackScope: this,
            loop: true,
        });

        // Collisions
        this.physics.add.overlap(this.player, this.enemyGroup, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.player, this.boobuckGroup, this.collectBoobuck, null, this);
        this.physics.add.overlap(this.player, this.lifeGroup, this.collectLife, null, this);
        this.physics.add.overlap(this.player, this.boostCrateGroup, this.collectBoostCrate, null, this);
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
        const screenWidth = 1080;
        const screenHeight = 1920;

        this.background = this.add.tileSprite(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 'path');
    }

    setupForMobile() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.background = this.add.tileSprite(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 'path');
    }

    updateLivesDisplay() {
        this.livesGroup.clear(true, true); // Clear current lives display
        const startX = this.hpBar.x - 100; // Adjust starting X position
        const spacing = 30; // Space between lives

        for (let i = 0; i < this.lives; i++) {
            this.livesGroup.add(
                this.add.image(startX + i * spacing, this.hpBar.y, 'ghost-life').setScale(0.3).setDepth(21)
            );
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.RND.pick(this.columns);
        const enemyType = Phaser.Math.RND.pick(['pumpkin-enemy', 'tombstone-enemy']);
        const enemy = this.enemyGroup.create(x, 0, enemyType).setVelocityY(this.speed).setScale(0.5).setDepth(9);
        if (this.activeBoost === 'enemy-speed-up') {
            enemy.setVelocityY(this.speed * 2); // Apply boost to new enemies
        }
    }

    spawnBoobuck() {
        const x = Phaser.Math.RND.pick(this.columns);
        this.boobuckGroup.create(x, 0, 'boobuck').setVelocityY(this.speed).setScale(0.5).setDepth(9);
    }

    spawnLife() {
        const x = Phaser.Math.RND.pick(this.columns);
        this.lifeGroup.create(x, 0, 'ghost-life').setVelocityY(this.speed).setScale(0.5).setDepth(9);
    }

    spawnBoostCrate() {
        const x = Phaser.Math.RND.pick(this.columns);
        this.boostCrateGroup.create(x, 0, 'boost-crate').setVelocityY(this.speed).setScale(0.5).setDepth(9);
    }

    handlePlayerHit(player, enemy) {
        enemy.destroy();
        if (!this.activeBoost || this.activeBoost !== 'invincibility-mode') {
            this.lives--;
            this.updateLivesDisplay();
            if (this.lives <= 0) {
                console.log('Game Over');
                this.scene.start('GameOver');
                this.resetPlayerState(); // Reset player state after game over
            }
        }
    }

    resetPlayerState() {
        this.lives = 4;
        this.updateLivesDisplay();
        this.player.setPosition(this.columns[this.currentColumnIndex], this.rows[this.currentRowIndex]);
    }

    collectBoobuck(player, boobuck) {
        this.tweens.add({
            targets: boobuck,
            x: this.boobucksImage.x,
            y: this.boobucksImage.y,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: 300,
            onComplete: () => {
                boobuck.destroy();
                this.boobucksCollected++;
                this.boobucksText.setText(`${this.boobucksCollected}`);
            },
        });
    }

    collectLife(player, life) {
        life.destroy();
        this.lives++;
        this.updateLivesDisplay();
    }

    collectBoostCrate(player, crate) {
        crate.destroy();

        // Randomly select a boost
        const boostEffects = ['10-boobucks', 'invincibility-mode', 'magnet-boost', 'enemy-speed-up'];
        const selectedBoost = Phaser.Math.RND.pick(boostEffects);

        const boostImage = this.add.image(crate.x, crate.y, selectedBoost).setScale(0.5).setDepth(22);

        // Animate boost image to the top-left corner
        this.tweens.add({
            targets: boostImage,
            x: this.boostDisplay.x,
            y: this.boostDisplay.y,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 500,
            onComplete: () => {
                boostImage.destroy();
                if (selectedBoost !== '10-boobucks') {
                    this.boostDisplay.setTexture(selectedBoost); // Set boost image in the corner
                }
                this.applyBoost(selectedBoost); // Apply the boost effect
            },
        });
    }

    applyBoost(boost) {
        switch (boost) {
            case '10-boobucks':
                for (let i = 0; i < 10; i++) {
                    const boobuck = this.boobuckGroup.create(
                        Phaser.Math.Between(0, this.cameras.main.width),
                        0,
                        'boobuck'
                    );
                    this.tweens.add({
                        targets: boobuck,
                        x: this.boobucksImage.x,
                        y: this.boobucksImage.y,
                        scaleX: 0.2,
                        scaleY: 0.2,
                        duration: 300,
                        onComplete: () => {
                            boobuck.destroy();
                            this.boobucksCollected++;
                            this.boobucksText.setText(`${this.boobucksCollected}`);
                        },
                    });
                }
                break;

            case 'invincibility-mode':
                this.activeBoost = 'invincibility-mode';
                this.player.setTint(0xFFD700); // Golden glow
                this.time.delayedCall(10000, () => {
                    this.activeBoost = null;
                    this.boostDisplay.setTexture('boost-crate'); // Revert boost image
                    this.player.clearTint(); // Remove golden glow
                });
                break;

            case 'magnet-boost':
                this.activeBoost = 'magnet-boost';
                this.time.addEvent({
                    delay: 200,
                    callback: () => {
                        this.boobuckGroup.getChildren().forEach((boobuck) => {
                            this.physics.moveToObject(boobuck, this.player, 400);
                        });
                    },
                    repeat: 49,
                });
                this.time.delayedCall(10000, () => {
                    this.activeBoost = null;
                    this.boostDisplay.setTexture('boost-crate'); // Revert boost image
                });
                break;

            case 'enemy-speed-up':
                this.activeBoost = 'enemy-speed-up';
                this.boostDisplay.setTexture('enemy-speed-up'); // Set enemy speed-up image

                // Increase speed for current enemies
                this.enemyGroup.getChildren().forEach((enemy) => {
                    enemy.setVelocityY(this.speed * 2); // 100% faster
                });

                // Double enemy spawn rate
                this.enemySpawnTimer.remove(false); // Remove existing timer
                this.enemySpawnTimer = this.time.addEvent({
                    delay: 1000, // Spawn twice as fast
                    callback: this.spawnEnemy,
                    callbackScope: this,
                    loop: true,
                });

                // Revert after 10 seconds
                this.time.delayedCall(10000, () => {
                    this.activeBoost = null;
                    this.boostDisplay.setTexture('boost-crate'); // Revert boost image
                    this.enemySpawnTimer.remove(false); // Remove boosted spawn rate
                    this.enemySpawnTimer = this.time.addEvent({
                        delay: 2000, // Reset to normal spawn rate
                        callback: this.spawnEnemy,
                        callbackScope: this,
                        loop: true,
                    });
                });
                break;
        }
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseMenu');
    }
}
