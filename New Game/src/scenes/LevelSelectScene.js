class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.tabContentContainer = null;
        this.tooltip = null;
    }

    create() {
        this.tooltip = new ItemTooltip(this);
        this.drawMenuBackground();
        this.add.bitmapText(this.scale.width / 2, 40, 'main_font', 'Game Menu', 12).setOrigin(0.5);
        this.createTabs();
        this.tabContentContainer = this.add.container();
        this.showLevelsTab();
    }

    drawMenuBackground() {
        const { width, height } = this.scale;
        const bg = this.add.tileSprite(0, 0, width, height, 'menu_bg_tile').setOrigin(0, 0);
        bg.setTileScale(0.25); // A value of 2 makes the pattern twice as large.
                    // A value of 0.5 would make it twice as small.
        const header = this.add.image(0, 0, 'menu_horizontal_bar').setOrigin(0, 0);
        header.setDisplaySize(width, header.height * 0.12);
        const footer = this.add.image(0, height, 'menu_horizontal_bar').setOrigin(0, 1).setFlipY(true);
        footer.setDisplaySize(width, footer.height * 0.12);
        const columnHeight = height - header.height - footer.height;
        const leftColumn = this.add.image(0, header.height, 'menu_vertical_column').setOrigin(0, 0);
        leftColumn.setDisplaySize(leftColumn.width, columnHeight);
        const rightColumn = this.add.image(width, header.height, 'menu_vertical_column').setOrigin(1, 0).setFlipX(true);
        rightColumn.setDisplaySize(rightColumn.width, columnHeight);
    }
    
    createTabs() {
        const tabY = 85;
        const tabLabels = ['Levels', 'Challenges', 'Inventory', 'Collection'];
        const tabContainer = this.add.container(0, tabY);
        tabLabels.forEach((label, index) => {
            const tabX = (this.scale.width / tabLabels.length) * (index + 0.5);
            const tabButton = this.add.bitmapText(tabX, 0, 'main_font', label, 8).setOrigin(0.5).setInteractive({ useHandCursor: true });
            tabButton.on('pointerdown', () => this.handleTabClick(label));
            tabContainer.add(tabButton);
        });
    }

    handleTabClick(tabLabel) {
        if (this.tabContentContainer) { this.tabContentContainer.removeAll(true); }
        if (tabLabel === 'Levels') { this.showLevelsTab(); } 
        else if (tabLabel === 'Challenges') { this.showChallengesTab(); } 
        else if (tabLabel === 'Inventory') { this.showInventoryTab(); } 
        else if (tabLabel === 'Collection') { this.showPlaceholderTab('Collection Log'); }
    }

    showLevelsTab() {
        const levels = this.cache.json.get('levels');
        const startY = 150;
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const col = i % 4;
            const row = Math.floor(i / 4);
            const cellX = (this.scale.width / 4) * (col + 0.5);
            const cellY = startY + (row * 100);
            const levelButton = this.add.bitmapText(cellX, cellY, 'main_font', level.name, 16).setOrigin(0.5).setInteractive({ useHandCursor: true });
            levelButton.on('pointerdown', () => { this.scene.start('LevelScene', { levelId: level.id }); });
            this.tabContentContainer.add(levelButton);
        }
    }

    showChallengesTab() {
        const levels = this.cache.json.get('levels');
        const startY = 150;
        const challengesDisplayContainer = this.add.container();
        this.tabContentContainer.add(challengesDisplayContainer);
        levels.forEach((level, index) => {
            const levelButton = this.add.bitmapText(this.scale.width * 0.25, startY + (index * 40), 'main_font', `Level ${level.name}`, 8).setOrigin(0.5).setInteractive({ useHandCursor: true });
            levelButton.on('pointerdown', () => { this.displayChallengesForLevel(level, challengesDisplayContainer); });
            this.tabContentContainer.add(levelButton);
        });
        if (levels.length > 0) { this.displayChallengesForLevel(levels[0], challengesDisplayContainer); }
    }

    displayChallengesForLevel(levelData, container) {
        container.removeAll(true);
        const startY = 150;
        levelData.challenges.forEach((challenge, index) => {
            const challengeId = `${levelData.id}_challenge_${index}`;
            const hasBeenCompleted = GameDataManager.profile.challengeCompletions[challengeId];
            const textColor = hasBeenCompleted ? 0x00ff00 : 0xffffff;
            const challengeText = this.add.bitmapText(this.scale.width * 0.65, startY + (index * 30), 'main_font', challenge.description, 8).setOrigin(0.5, 0.5).setTint(textColor);
            container.add(challengeText);
        });
    }

    showInventoryTab() {
        const panelY = 280;
        const inventoryY = 500;
        this.drawEquipmentPanel(panelY);
        this.drawPlayerPreviewPanel(panelY);
        this.drawStatsPanel(panelY);
        this.drawInventoryGrid(inventoryY);
    }
    
    drawEquipmentPanel(panelY) {
        const itemDb = this.cache.json.get('itemDatabase');
        const equipment = GameDataManager.profile.equipment;
        const panelX = this.scale.width * 0.22;
        const slotPositions = {
            head: { x: panelX, y: panelY - 60 },
            chest: { x: panelX, y: panelY },
            legs: { x: panelX, y: panelY + 60 },
            main_hand: { x: panelX - 60, y: panelY },
            off_hand: { x: panelX + 60, y: panelY }
        };
        const box = this.add.graphics({ lineStyle: { width: 1, color: 0x888888 } });
        this.tabContentContainer.add(box);
        for (const slotName in slotPositions) {
            const pos = slotPositions[slotName];
            box.strokeRect(pos.x - 24, pos.y - 24, 48, 48);
            const itemId = equipment[slotName];
            if (itemId) {
                const itemData = itemDb[itemId];
                // --- SCALE: Equipped Item Icons (Inventory Menu) ---
                const icon = this.add.image(pos.x, pos.y, itemData.icon).setScale(1).setInteractive();
                icon.on('pointerover', (pointer) => this.tooltip.show(pointer.x, pointer.y, itemData, 'Unequip'));
                icon.on('pointerout', () => this.tooltip.hide());
                icon.on('pointerdown', () => {
                    GameDataManager.unequipItem(slotName);
                    this.showInventoryTab();
                });
                this.tabContentContainer.add(icon);
            }
        }
    }

    drawPlayerPreviewPanel(panelY) {
        const centerX = this.scale.width / 2;
        // --- SCALE: Player Preview (Inventory Menu) ---
        const playerPreview = this.add.sprite(centerX, panelY, 'player_real_image').setScale(0.15);
        this.tabContentContainer.add(playerPreview);
    }

    drawStatsPanel(panelY) {
        const itemDb = this.cache.json.get('itemDatabase');
        const totalStats = GameDataManager.calculateTotalStats(itemDb);
        let statsString = "Player Stats\n\n";
        for (const [stat, value] of Object.entries(totalStats)) {
            const formattedStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            statsString += `${formattedStat}: ${value}\n`;
        }
        const statsText = this.add.bitmapText(this.scale.width * 0.78, panelY, 'main_font', statsString, 8).setOrigin(0.5);
        this.tabContentContainer.add(statsText);
    }

    drawInventoryGrid(startY) {
        const itemDb = this.cache.json.get('itemDatabase');
        const inventory = GameDataManager.profile.inventory;
        const cols = 12;
        const rows = 4;
        const cellSize = 52;
        const startX = (this.scale.width - (cols * cellSize)) / 2;
        const box = this.add.graphics({ lineStyle: { width: 1, color: 0x888888 } });
        this.tabContentContainer.add(box);
        for (let i = 0; i < inventory.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cellX = startX + (col * cellSize);
            const cellY = startY + (row * cellSize);
            box.strokeRect(cellX, cellY, cellSize, cellSize);
            const slotData = inventory[i];
            if (slotData) {
                const itemData = itemDb[slotData.itemId];
                const iconX = cellX + cellSize / 2;
                const iconY = cellY + cellSize / 2;
                // --- SCALE: Inventory Grid Icons (Inventory Menu) ---
                const icon = this.add.image(iconX, iconY, itemData.icon).setScale(1).setInteractive();
                icon.on('pointerover', (pointer) => this.tooltip.show(pointer.x, pointer.y, itemData, itemData.action));
                icon.on('pointerout', () => this.tooltip.hide());
                icon.on('pointerdown', () => {
                    if (itemData.action === 'equip') {
                        GameDataManager.equipItem(i, itemDb);
                        this.showInventoryTab();
                    }
                });
                this.tabContentContainer.add(icon);
            }
        }
    }

    showPlaceholderTab(tabName) {
        const placeholderText = this.add.bitmapText(this.scale.width / 2, this.scale.height / 2, 'main_font', `${tabName}\n\n(Coming Soon)`, 12).setOrigin(0.5).setCenterAlign();
        this.tabContentContainer.add(placeholderText);
    }
}