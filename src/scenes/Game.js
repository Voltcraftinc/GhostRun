import PauseMenu from './PauseMenu'; 

// Configuration constants
const COLUMN_POSITIONS = [150, 417, 684, 950];
const ROW_POSITIONS = [200, 400, 600, 800, 1000, 1200, 1400, 1600];
const INITIAL_LIVES = 4;
const MOVE_DELAY = 200; 
const SCROLL_SPEED = 5;
const BASE_SPEED = 200;
const ENEMY_SPAWN_RATE = 2000;
const BOOBUCK_SPAWN_RATE = 5000;
const LIFE_SPAWN_RATE = 15000;
const BOOST_SPAWN_RATE = 20000;
const BOOST_DURATION = 10000;

// Boost configuration object
const BOOSTS = {
    '10-boobucks': {
        duration: 0,
        apply(scene) {
            for (let i = 0; i < 10; i++) {
                const boobuck = scene.boobuckGroup.create(
                    Phaser.Math.Between(0, scene.cameras.main.width),
                    0,
                    'boobuck'
                );
                scene.tweens.add({
                    targets: boobuck,
                    x: scene.boobucksImage.x,
                    y: scene.boobucksImage.y,
                    scaleX: 0.2,
                    scaleY: 0.2,
                    duration: 300,
                    onComplete: () => {
                        boobuck.destroy();
                        scene.boobucksCollected++;
                        scene.boobucksText.setText(`${scene.boobucksCollected}`);
                    },
                });
            }
        },
        remove(scene) { /* no cleanup needed */ },
    },
    'invincibility-mode': {
        duration: BOOST_DURATION,
        apply(scene) {
            scene.player.setTint(0xFFD700);
        },
        remove(scene) {
            scene.boostDisplay.setTexture('boost-crate');
            scene.player.clearTint();
        },
    },
    'magnet-boost': {
        duration: BOOST_DURATION,
        apply(scene) {
            // Pull boobucks towards player periodically
            scene.magnetEvent = scene.time.addEvent({
                delay: 200,
                callback: () => {
                    scene.boobuckGroup.getChildren().forEach((boobuck) => {
                        scene.physics.moveToObject(boobuck, scene.player, 400);
                    });
                },
                repeat: (BOOST_DURATION / 200) - 1,
            });
        },
        remove(scene) {
            scene.boostDisplay.setTexture('boost-crate');
            if (scene.magnetEvent) {
                scene.magnetEvent.remove(false);
                scene.magnetEvent = null;
            }
        },
    },
    'enemy-speed-up': {
        duration: BOOST_DURATION,
        apply(scene) {
            // Increase enemy velocity
            scene.enemyGroup.getChildren().forEach((enemy) => {
                enemy.setVelocityY(BASE_SPEED * 2);
            });
            // Increase spawn rate
            if (scene.enemySpawnTimer) scene.enemySpawnTimer.remove(false);
            scene.enemySpawnTimer = scene.time.addEvent({
                delay: 1000,
                callback: scene.spawnEnemy,
                callbackScope: scene,
                loop: true,
            });
        },
        remove(scene) {
            scene.boostDisplay.setTexture('boost-crate');
            // Reset spawn rate
            if (scene.enemySpawnTimer) scene.enemySpawnTimer.remove(false);
            scene.enemySpawnTimer = scene.time.addEvent({
                delay: ENEMY_SPAWN_RATE,
                callback: scene.spawnEnemy,
                callbackScope: scene,
                loop: true,
            });
        },
    },
};

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.columns = COLUMN_POSITIONS;
        this.rows = ROW_POSITIONS;
        this.currentColumnIndex = 1;
        this.currentRowIndex = this.rows.length - 1;
        this.lives = INITIAL_LIVES;
        this.boobucksCollected = 0;
        this.lastMoveTime = 0; 
        this.moveDelay = MOVE_DELAY;
        this.scrollSpeed = SCROLL_SPEED;
        this.speed = BASE_SPEED;
        this.activeBoost = null;
        this.musicPlaying = false;
        this.distance = 0;
        this.bestDistance = parseInt(localStorage.getItem('bestDistance') || '0', 10);
    }

    create() {
        const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
        if (isMobile) {
            this.setupForMobile();
        } else {
            this.setupForDesktop();
        }

        // Pause Button
        this.pauseButton = this.add.image(this.cameras.main.width - 100, 50, 'pause')
            .setInteractive()
            .setDepth(21);
        this.pauseButton.on('pointerdown', this.pauseGame, this);

        // Player
        this.player = this.physics.add.sprite(
            this.columns[this.currentColumnIndex],
            this.rows[this.currentRowIndex],
            'ghost-main-character'
        ).setScale(0.5).setDepth(10);
        this.player.setCollideWorldBounds(true);

        // Lives Display
        this.livesGroup = this.add.group();
        this.hpBar = this.add.image(this.cameras.main.width / 2, this.cameras.main.height - 100, 'ghostrun-hp-bar')
            .setScale(0.8)
            .setDepth(20);
        this.updateLivesDisplay();

        // Boobucks Display (top-center)
        this.boobucksImage = this.add.image(this.cameras.main.width / 2, 50, 'boobucks-game-amount')
            .setDepth(20);
        this.boobucksText = this.add.text(this.cameras.main.width / 2, 50, `${this.boobucksCollected}`, {
            fontSize: '40px', fill: '#fff'
        }).setOrigin(0.5).setDepth(21);

        // Boost Display (top-left)
        this.boostDisplay = this.add.image(100, 50, 'boost-crate').setScale(0.5).setDepth(21);

        // Distance Boxes
        this.distanceBox = this.add.image(100, this.cameras.main.height - 100, 'distance-box')
            .setDepth(20).setScale(0.4);
        this.distanceText = this.add.text(this.distanceBox.x, this.distanceBox.y, '0m', {
            fontSize: '24px', fill: '#fff'
        }).setOrigin(0.5).setDepth(21);

        this.bestDistanceBox = this.add.image(this.cameras.main.width - 100, this.cameras.main.height - 100, 'distance-best-box')
            .setDepth(20).setScale(0.4);
        this.bestDistanceText = this.add.text(this.bestDistanceBox.x, this.bestDistanceBox.y, `Best: ${this.bestDistance}m`, {
            fontSize:'24px', fill:'#fff'
        }).setOrigin(0.5).setDepth(21);

        // Background Music
        if (!this.musicPlaying) {
            this.backgroundMusic = this.sound.add('phantom-midnight', { loop: true });
            this.backgroundMusic.play();
            this.musicPlaying = true;
        }

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        if (isMobile) {
            this.addTouchControls();
        }

        // Groups
        this.enemyGroup = this.physics.add.group();
        this.boobuckGroup = this.physics.add.group();
        this.lifeGroup = this.physics.add.group();
        this.boostCrateGroup = this.physics.add.group();

        // Spawners
        this.enemySpawnTimer = this.time.addEvent({
            delay: ENEMY_SPAWN_RATE,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });
        this.time.addEvent({
            delay: BOOBUCK_SPAWN_RATE,
            callback: this.spawnBoobuck,
            callbackScope: this,
            loop: true,
        });
        this.time.addEvent({
            delay: LIFE_SPAWN_RATE,
            callback: this.spawnLife,
            callbackScope: this,
            loop: true,
        });
        this.time.addEvent({
            delay: BOOST_SPAWN_RATE,
            callback: this.spawnBoostCrate,
            callbackScope: this,
            loop: true,
        });

        // Collisions
        this.physics.add.overlap(this.player, this.enemyGroup, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.player, this.boobuckGroup, this.collectBoobuck, null, this);
        this.physics.add.overlap(this.player, this.lifeGroup, this.collectLife, null, this);
        this.physics.add.overlap(this.player, this.boostCrateGroup, this.collectBoostCrate, null, this);

        // Enemy speed-up destroys items
        this.physics.add.overlap(this.enemyGroup, this.boobuckGroup, this.enemyDestroyItem, null, this);
        this.physics.add.overlap(this.enemyGroup, this.lifeGroup, this.enemyDestroyItem, null, this);
        this.physics.add.overlap(this.enemyGroup, this.boostCrateGroup, this.enemyDestroyItem, null, this);
    }

    update(time, delta) {
        // Parallax Scrolling
        this.background.tilePositionY -= this.scrollSpeed;

        // Movement
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

        // Distance Tracking
        this.distance += (delta * 0.1);
        const currentDist = Math.floor(this.distance);
        this.distanceText.setText(`${currentDist}m`);
        if (currentDist > this.bestDistance) {
            this.bestDistance = currentDist;
            this.bestDistanceText.setText(`Best: ${this.bestDistance}m`);
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

    spawnItem({ group, texture, scale = 0.5, velocityY = this.speed }) {
        const x = Phaser.Math.RND.pick(this.columns);
        const item = group.create(x, 0, texture).setVelocityY(velocityY).setScale(scale).setDepth(9);
        return item;
    }

    updateLivesDisplay() {
        this.livesGroup.clear(true, true); 
        const startX = this.hpBar.x - 100;
        const spacing = 30; 
        for (let i = 0; i < this.lives; i++) {
            this.livesGroup.add(
                this.add.image(startX + i * spacing, this.hpBar.y, 'ghost-life').setScale(0.3).setDepth(21)
            );
        }
    }

    spawnEnemy() {
        const enemyType = Phaser.Math.RND.pick(['pumpkin-enemy', 'tombstone-enemy']);
        const velocity = (this.activeBoost === 'enemy-speed-up') ? this.speed * 2 : this.speed;
        this.spawnItem({ group: this.enemyGroup, texture: enemyType, velocityY: velocity });
    }

    spawnBoobuck() {
        this.spawnItem({ group: this.boobuckGroup, texture: 'boobuck' });
    }

    spawnLife() {
        this.spawnItem({ group: this.lifeGroup, texture: 'ghost-life' });
    }

    spawnBoostCrate() {
        this.spawnItem({ group: this.boostCrateGroup, texture: 'boost-crate' });
    }

    handlePlayerHit(player, enemy) {
        enemy.destroy();
        this.sound.play('hit_damage');
        if (this.activeBoost !== 'invincibility-mode') {
            this.lives--;
            this.updateLivesDisplay();
            if (this.lives <= 0) {
                this.endGame();
            }
        }
    }

    resetPlayerState() {
        this.lives = INITIAL_LIVES;
        this.updateLivesDisplay();
        this.player.setPosition(this.columns[this.currentColumnIndex], this.rows[this.currentRowIndex]);
    }

    collectBoobuck(player, boobuck) {
        // Prevent multiple increments by disabling boobuck right away
        if (boobuck.alreadyCollected) return;
        boobuck.alreadyCollected = true;
        boobuck.disableBody(true, false);

        this.sound.play('coin_collect');
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
        this.sound.play('life_collect');
        life.destroy();
        this.lives++;
        this.updateLivesDisplay();
    }

    collectBoostCrate(player, crate) {
        this.sound.play('boost_sound');
        crate.destroy();
        const boostEffects = ['10-boobucks', 'invincibility-mode', 'magnet-boost', 'enemy-speed-up'];
        const selectedBoost = Phaser.Math.RND.pick(boostEffects);

        const boostImage = this.add.image(crate.x, crate.y, selectedBoost).setScale(0.5).setDepth(22);
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
                    this.boostDisplay.setTexture(selectedBoost);
                }
                this.applyBoost(selectedBoost);
            },
        });
    }

    applyBoost(boostKey) {
        const boostData = BOOSTS[boostKey];
        if (!boostData) return;

        this.activeBoost = boostKey;
        boostData.apply(this);

        if (boostData.duration > 0) {
            this.showBoostBar(boostData.duration, () => {
                if (this.activeBoost === boostKey) {
                    this.activeBoost = null;
                    boostData.remove(this);
                }
            });
        } else {
            // Immediate boost ends instantly
            this.activeBoost = null;
        }
    }

    showBoostBar(duration, onComplete) {
        const barWidth = this.cameras.main.width - 200;
        const barX = this.cameras.main.width / 2;
        const barY = 120; 

        this.boostBar = this.add.rectangle(barX, barY, barWidth, 10, 0x00ff00).setDepth(22);

        this.tweens.add({
            targets: this.boostBar,
            width: 0,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.boostBar.destroy();
                onComplete();
            }
        });
    }

    enemyDestroyItem(enemy, item) {
        if (this.activeBoost === 'enemy-speed-up') {
            item.destroy();
        }
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseMenu');
    }

    endGame() {
        localStorage.setItem('bestDistance', this.bestDistance);
        this.scene.start('GameOver');
        this.resetPlayerState();
    }

    addTouchControls() {
        // Implement mobile touch controls if needed.
    }
}
