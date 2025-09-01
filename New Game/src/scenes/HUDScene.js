class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene', active: false });
        this.inGameInventoryContainer = null;
        this.inGameEquipmentContainer = null;
        this.inGameStatsText = null;
    }

    create() {
        const SQUARE_SIZE = 80;
        const UI_Y_START = this.scale.height - (SQUARE_SIZE * 2);
        const UI_HEIGHT = SQUARE_SIZE * 2;
        const ORB_RADIUS = 40;
        
        this.add.graphics({ fillStyle: { color: 0x111111, alpha: 0.8 } }).fillRect(0, UI_Y_START, this.scale.width, UI_HEIGHT);
        const boundaryLines = this.add.graphics({ lineStyle: { width: 2, color: 0x888888, alpha: 0.7 } });
        boundaryLines.lineBetween(0, UI_Y_START, this.scale.width, UI_Y_START);
        const gameplayWidth = 240;
        const gameplayAreaOffsetX = (this.scale.width - gameplayWidth) / 2;
        boundaryLines.lineBetween(gameplayAreaOffsetX, 0, gameplayAreaOffsetX, UI_Y_START);
        boundaryLines.lineBetween(gameplayAreaOffsetX + gameplayWidth, 0, gameplayAreaOffsetX + gameplayWidth, UI_Y_START);

        const invGridBox = this.add.graphics({ lineStyle: { width: 1, color: 0x888888, alpha: 0.5 } });
        const invCellSize = 36;
        for (let row = 0; row < 12; row++) {
            for (let col = 0; col < 4; col++) {
                invGridBox.strokeRect(10 + (col * invCellSize), 10 + (row * invCellSize), invCellSize, invCellSize);
            }
        }
        this.inGameInventoryContainer = this.add.container();
        this.drawInGameInventoryIcons();

        const equipGridBox = this.add.graphics({ lineStyle: { width: 1, color: 0x888888, alpha: 0.5 } });
        this.inGameEquipmentContainer = this.add.container();
        this.drawInGameEquipmentIcons(equipGridBox);
        this.inGameStatsText = this.add.bitmapText(this.scale.width - 150, 250, 'main_font', '', 8);
        
        const healthOrbX = 60;
        const healthOrbY = UI_Y_START + (UI_HEIGHT / 2);
        this.healthOrbFill = this.add.graphics();
        this.healthOrbMask = this.make.graphics();
        this.healthOrbFill.setMask(this.healthOrbMask.createGeometryMask());
        this.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } }).strokeCircle(healthOrbX, healthOrbY, ORB_RADIUS);
        this.healthText = this.add.bitmapText(healthOrbX, healthOrbY, 'main_font', '100', 12).setOrigin(0.5);
        const staminaOrbX = this.scale.width - 60;
        const staminaOrbY = healthOrbY;
        this.staminaOrbFill = this.add.graphics();
        this.staminaOrbMask = this.make.graphics();
        this.staminaOrbFill.setMask(this.staminaOrbMask.createGeometryMask());
        this.add.graphics({ lineStyle: { width: 2, color: 0x3399ff } }).strokeCircle(staminaOrbX, staminaOrbY, ORB_RADIUS);
        this.staminaText = this.add.bitmapText(staminaOrbX, staminaOrbY, 'main_font', '100', 12).setOrigin(0.5);
        
        const centerX = this.scale.width / 2;
        const gridCellSize = 48; 
        const gridTopLeftX = centerX - (gridCellSize * 2); 
        const gridTopLeftY = healthOrbY - gridCellSize; 
        const centerGridBox = this.add.graphics({ lineStyle: { width: 1, color: 0x888888, alpha: 0.9 } });
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                centerGridBox.strokeRect(gridTopLeftX + (col * gridCellSize), gridTopLeftY + (row * gridCellSize), gridCellSize, gridCellSize);
            }
        }
        const shieldTypes = ['range', 'magic', 'melee'];
        this.shieldGrid = {};
        shieldTypes.forEach((type, index) => {
            const cellCenterX = gridTopLeftX + (index * gridCellSize) + (gridCellSize / 2);
            const cellCenterY = gridTopLeftY + (gridCellSize / 2);
            // --- SCALE: Central HUD Shield Icons ---
            this.shieldGrid[type] = this.add.image(cellCenterX, cellCenterY, `projectile_${type}`).setScale(2);
            const keybindTextX = gridTopLeftX + (index * gridCellSize) + 4;
            const keybindTextY = gridTopLeftY + 4;
            this.add.bitmapText(keybindTextX, keybindTextY, 'main_font', `${index + 1}`, 8);
        });
        this.enemyHealthBar = this.add.graphics();

        this.levelScene = this.scene.get('LevelScene');
        this.levelScene.events.on('updateUI', this.updateHUD, this);
        this.levelScene.events.on('gameOver', this.showGameOver, this);
        this.levelScene.events.on('levelComplete', this.showLevelComplete, this);
        const currentLevelName = this.levelScene.levelData.name;
        this.add.bitmapText(10, 10, 'main_font', `Level ${currentLevelName}`, 12);
    }

    drawInGameInventoryIcons() {
        this.inGameInventoryContainer.removeAll(true);
        const itemDb = this.cache.json.get('itemDatabase');
        const inventory = GameDataManager.profile.inventory;
        const invCellSize = 36;
        for (let i = 0; i < inventory.length; i++) {
            const slotData = inventory[i];
            if (slotData) {
                const itemData = itemDb[slotData.itemId];
                if (itemData && itemData.icon) {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const iconX = 10 + (col * invCellSize) + (invCellSize / 2);
                    const iconY = 10 + (row * invCellSize) + (invCellSize / 2);
                    // --- SCALE: In-Game Inventory Icons (Left Side) ---
                    const icon = this.add.image(iconX, iconY, itemData.icon).setScale(0.75);
                    this.inGameInventoryContainer.add(icon);
                }
            }
        }
    }

    drawInGameEquipmentIcons(box) {
        this.inGameEquipmentContainer.removeAll(true);
        const itemDb = this.cache.json.get('itemDatabase');
        const equipment = GameDataManager.profile.equipment;
        const equipCellSize = 36;
        const equipStartX = this.scale.width - 154;
        const slotPositions = {
            head: { x: equipStartX + equipCellSize, y: 10 },
            main_hand: { x: equipStartX, y: 10 + equipCellSize },
            chest: { x: equipStartX + equipCellSize, y: 10 + equipCellSize },
            off_hand: { x: equipStartX + equipCellSize * 2, y: 10 + equipCellSize },
            legs: { x: equipStartX + equipCellSize, y: 10 + equipCellSize * 2 }
        };
        for (const slotName in slotPositions) {
            const pos = slotPositions[slotName];
            box.strokeRect(pos.x, pos.y, equipCellSize, equipCellSize);
            const itemId = equipment[slotName];
            if (itemId) {
                const itemData = itemDb[itemId];
                if (itemData && itemData.icon) {
                    // --- SCALE: In-Game Equipped Item Icons (Right Side) ---
                    const icon = this.add.image(pos.x + equipCellSize/2, pos.y + equipCellSize/2, itemData.icon).setScale(0.75);
                    this.inGameEquipmentContainer.add(icon);
                }
            }
        }
    }
    
    updateStatsDisplay() {
        const itemDb = this.cache.json.get('itemDatabase');
        const totalStats = GameDataManager.calculateTotalStats(itemDb);
        let statsString = "Equip Stats\n\n";
        if (Object.keys(totalStats).length === 0) {
            statsString += "None";
        } else {
            for (const [stat, value] of Object.entries(totalStats)) {
                const formattedStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                statsString += `${formattedStat}: +${value}\n`;
            }
        }
        this.inGameStatsText.setText(statsString);
    }

    updateHUD(data) {
        if (!data) return;
        this.updateStatsDisplay();
        const ORB_RADIUS = 40;
        const healthPercent = data.health.current / data.health.max;
        const healthOrbX = 60;
        const healthOrbY = this.scale.height - 80;
        this.healthText.setText(Math.ceil(data.health.current));
        this.healthOrbFill.clear().fillStyle(0xff0000, 1).fillCircle(healthOrbX, healthOrbY, ORB_RADIUS);
        this.healthOrbMask.clear().fillStyle(0xffffff, 1).fillRect(healthOrbX - ORB_RADIUS, healthOrbY + ORB_RADIUS - (ORB_RADIUS * 2 * healthPercent), ORB_RADIUS * 2, ORB_RADIUS * 2 * healthPercent);
        const staminaPercent = data.stamina.current / data.stamina.max;
        const staminaOrbX = this.scale.width - 60;
        const staminaOrbY = this.scale.height - 80;
        this.staminaText.setText(Math.ceil(data.stamina.current));
        this.staminaOrbFill.clear().fillStyle(0x3399ff, 1).fillCircle(staminaOrbX, staminaOrbY, ORB_RADIUS);
        this.staminaOrbMask.clear().fillStyle(0xffffff, 1).fillRect(staminaOrbX - ORB_RADIUS, staminaOrbY + ORB_RADIUS - (ORB_RADIUS * 2 * staminaPercent), ORB_RADIUS * 2, ORB_RADIUS * 2 * staminaPercent);
        for (const type in this.shieldGrid) { this.shieldGrid[type].setAlpha(type === data.activeShield ? 1.0 : 0.3); }
        const enemy = this.levelScene.enemy;
        if (!enemy) return;
        const enemyHealthPercent = data.enemyHealth.current / data.enemyHealth.max;
        const barWidth = 40;
        this.enemyHealthBar.clear();
        this.enemyHealthBar.fillStyle(0xff0000, 1).fillRect(enemy.x - barWidth / 2, enemy.y - 30, barWidth, 5);
        this.enemyHealthBar.fillStyle(0x00ff00, 1).fillRect(enemy.x - barWidth / 2, enemy.y - 30, barWidth * enemyHealthPercent, 5);
    }
    
    showGameOver() {
        this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.7 } }).fillRect(0, 0, this.scale.width, this.scale.height);
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        this.add.bitmapText(centerX, centerY - 40, 'main_font', 'Game Over', 32).setOrigin(0.5);
        const restartButton = this.add.bitmapText(centerX, centerY + 20, 'main_font', 'Restart Level', 16).setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            const levelIdToReplay = this.levelScene.levelId;
            this.levelScene.events.off('updateUI', this.updateHUD, this);
            this.scene.stop('LevelScene');
            this.scene.stop('HUDScene');
            this.scene.start('LevelScene', { levelId: levelIdToReplay });
        });
        const backButton = this.add.bitmapText(centerX, centerY + 60, 'main_font', 'Back to Levels', 16).setOrigin(0.5);
        backButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.levelScene.events.off('updateUI', this.updateHUD, this);
            this.scene.stop('LevelScene');
            this.scene.stop('HUDScene');
            this.scene.start('LevelSelectScene');
        });
    }

    showLevelComplete(data) {
        this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.7 } }).fillRect(0, 0, this.scale.width, this.scale.height);
        const centerX = this.scale.width / 2;
        let currentY = this.scale.height / 2 - 200;
        let challengesCompletedCount = 0;
        this.add.bitmapText(centerX, currentY, 'main_font', 'Level Complete!', 24).setOrigin(0.5);
        currentY += 60;
        this.add.bitmapText(centerX, currentY, 'main_font', 'Challenges', 16).setOrigin(0.5);
        currentY += 30;
        for (const result of data.challenges) {
            const prefix = result.completed ? '[v]' : '[x]';
            const text = `${prefix} ${result.description}`;
            const challengeText = this.add.bitmapText(centerX, currentY, 'main_font', text, 8).setOrigin(0.5);
            if (result.completed) { challengeText.setTint(0x00ff00); challengesCompletedCount++; }
            currentY += 20;
        }
        currentY += 20;
        const bonusLootAmount = challengesCompletedCount * 33;
        this.add.bitmapText(centerX, currentY, 'main_font', `Bonus Loot +${bonusLootAmount}%`, 12).setOrigin(0.5);
        currentY += 40;
        const lootHeaderText = data.loot.every(l => l.wasAdded) ? 'Looted to Inventory:' : 'Inventory Full!';
        this.add.bitmapText(centerX, currentY, 'main_font', lootHeaderText, 16).setOrigin(0.5);
        currentY += 40;
        const itemDb = this.cache.json.get('itemDatabase');
        data.loot.forEach(lootItem => {
            const itemData = itemDb[lootItem.itemId];
            const itemX = centerX - 50;
            const textX = centerX - 20;
            if (itemData && itemData.icon) {
                // --- SCALE: Loot Screen Item Icons ---
                this.add.image(itemX, currentY, itemData.icon).setScale(1.5);
            }
            const lootText = `${lootItem.quantity}x ${itemData.name}`;
            const textObj = this.add.bitmapText(textX, currentY, 'main_font', lootText, 8).setOrigin(0, 0.5);
            if (!lootItem.wasAdded) { this.add.bitmapText(itemX - 25, currentY, 'main_font', 'X', 8).setOrigin(0.5).setTint(0xff0000); }
            currentY += 30;
        });
        currentY += 50;
        const replayButton = this.add.bitmapText(centerX, currentY, 'main_font', 'Replay Level', 16).setOrigin(0.5);
        replayButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            const levelIdToReplay = this.levelScene.levelId;
            this.levelScene.events.off('updateUI', this.updateHUD, this);
            this.scene.stop('LevelScene');
            this.scene.stop('HUDScene');
            this.scene.start('LevelScene', { levelId: levelIdToReplay });
        });
        currentY += 40;
        const allLevels = this.cache.json.get('levels');
        const currentLevelIndex = allLevels.findIndex(l => l.id === this.levelScene.levelId);
        const nextLevel = allLevels[currentLevelIndex + 1];
        if (nextLevel) {
            const nextLevelButton = this.add.bitmapText(centerX, currentY, 'main_font', 'Next Level', 16).setOrigin(0.5);
            nextLevelButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.levelScene.events.off('updateUI', this.updateHUD, this);
                this.scene.stop('LevelScene');
                this.scene.stop('HUDScene');
                this.scene.start('LevelScene', { levelId: nextLevel.id });
            });
            currentY += 40;
        }
        const backButton = this.add.bitmapText(centerX, currentY, 'main_font', 'Back to Levels', 16).setOrigin(0.5);
        backButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.levelScene.events.off('updateUI', this.updateHUD, this);
            this.scene.stop('LevelScene');
            this.scene.stop('HUDScene');
            this.scene.start('LevelSelectScene');
        });
    }
}