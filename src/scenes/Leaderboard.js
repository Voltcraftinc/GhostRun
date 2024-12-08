export default class Leaderboard extends Phaser.Scene {
    constructor() {
        super('Leaderboard');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Background overlay
        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9);

        // Title
        this.add.text(centerX, 100, 'Leaderboard (Top 100)', {
            fontSize: '48px',
            fill: '#fff',
        }).setOrigin(0.5);

        // Dummy leaderboard data
        this.leaderData = [];
        for (let i = 0; i < 100; i++) {
            this.leaderData.push({
                username: `Player${i + 1}`,
                boobucks: Phaser.Math.Between(0, 1000),
                distance: Phaser.Math.Between(0, 2000),
            });
        }

        this.currentSort = 'boobucks'; // Default sort by boobucks
        this.currentOrder = 'desc'; // Descending order

        // Create scrollable leaderboard
        this.createScrollableTable();

        // Return button
        const returnButton = this.add.text(centerX, this.cameras.main.height - 50, 'Return', {
            fontSize: '32px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive();

        returnButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    createScrollableTable() {
        const tableX = 100; // Padding for table
        const tableY = 150; // Start drawing below the title
        const tableWidth = this.cameras.main.width - 200;
        const visibleHeight = this.cameras.main.height - 300;

        // Create container for scrollable content
        this.scrollableContainer = this.add.container(tableX, tableY);

        // Mask for scrollable content
        const maskShape = this.add.graphics().fillRect(tableX, tableY, tableWidth, visibleHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollableContainer.setMask(mask);

        // Draw leaderboard table
        this.drawTable();

        // Enable scrolling
        this.enableScrolling();
    }

    drawTable() {
        const startX = 0; // Column starting position relative to container
        const startY = 0; // Start at the top of the container
        const colSpacing = 200;

        // Clear container content
        this.scrollableContainer.removeAll(true);

        // Titles (clickable to sort)
        const usernameTitle = this.add.text(startX, startY, 'Username', {
            fontSize: '24px',
            fill: '#fff',
        }).setInteractive();
        const boobucksTitle = this.add.text(startX + colSpacing, startY, 'Boobucks', {
            fontSize: '24px',
            fill: '#fff',
        }).setInteractive();
        const distanceTitle = this.add.text(startX + colSpacing * 2, startY, 'Distance', {
            fontSize: '24px',
            fill: '#fff',
        }).setInteractive();

        usernameTitle.on('pointerdown', () => this.changeSort('username'));
        boobucksTitle.on('pointerdown', () => this.changeSort('boobucks'));
        distanceTitle.on('pointerdown', () => this.changeSort('distance'));

        this.scrollableContainer.add([usernameTitle, boobucksTitle, distanceTitle]);

        // Populate leaderboard data
        let y = startY + 50; // Start drawing rows below titles
        this.sortLeaderboard();

        for (let i = 0; i < this.leaderData.length; i++) {
            const entry = this.leaderData[i];
            const userText = this.add.text(startX, y, entry.username, {
                fontSize: '20px',
                fill: '#fff',
            });
            const boobucksText = this.add.text(startX + colSpacing, y, `${entry.boobucks}`, {
                fontSize: '20px',
                fill: '#fff',
            });
            const distanceText = this.add.text(startX + colSpacing * 2, y, `${entry.distance}`, {
                fontSize: '20px',
                fill: '#fff',
            });

            this.scrollableContainer.add([userText, boobucksText, distanceText]);
            y += 30; // Space between rows
        }
    }

    enableScrolling() {
        const maxScrollY = Math.max(this.leaderData.length * 30 - (this.cameras.main.height - 300), 0); // Calculate max scroll distance

        // Scroll with mouse wheel
        this.input.on('wheel', (pointer, deltaX, deltaY) => {
            const newY = Phaser.Math.Clamp(this.scrollableContainer.y - deltaY * 0.5, 150 - maxScrollY, 150);
            this.scrollableContainer.y = newY;
        });
    }

    sortLeaderboard() {
        this.leaderData.sort((a, b) => {
            if (a[this.currentSort] < b[this.currentSort]) return this.currentOrder === 'asc' ? -1 : 1;
            if (a[this.currentSort] > b[this.currentSort]) return this.currentOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    changeSort(column) {
        if (this.currentSort === column) {
            // Toggle sort order
            this.currentOrder = this.currentOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = column;
            this.currentOrder = 'asc';
        }
        this.drawTable();
    }
}
