class LevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelScene' });
        this.SQUARE_SIZE = 80;
    }

    init(data) {
        this.levelId = data.levelId;
    }

    create() {
        const gameplayWidth = 240;
        const screenWidth = this.scale.width;
        const gameplayAreaOffsetX = (screenWidth - gameplayWidth) / 2;
        
        this.levelData = this.cache.json.get('levels').find(l => l.id === this.levelId);
        
        this.add.image(gameplayAreaOffsetX + (gameplayWidth / 2), this.scale.height / 2, 'game_background');
        
        this.uiBoundaryY = this.scale.height - (this.SQUARE_SIZE * 2);

        this.playerColumns = [
            gameplayAreaOffsetX + (this.SQUARE_SIZE * 0.5),
            gameplayAreaOffsetX + (this.SQUARE_SIZE * 1.5),
            gameplayAreaOffsetX + (this.SQUARE_SIZE * 2.5)
        ];

        this.challengeTrackers = { playerTookDamage: false, perfectBlocks: 0, startTime: this.time.now };

        const playerX = this.playerColumns[1];
        const playerY = this.scale.height - (this.SQUARE_SIZE * 3);
        this.player = new Player(this, playerX, playerY, 'player_real_image');

        // --- SCALE: In-Game Player ---
        this.player.setScale(0.07);

        const enemyX = gameplayAreaOffsetX + (gameplayWidth / 2);
        const enemyY = this.SQUARE_SIZE * 1.5;
        this.enemy = new Enemy(this, enemyX, enemyY, 'enemy_sprite', this.levelData.enemyStats);
        
        // --- SCALE: In-Game Enemy ---
        this.enemy.setScale(1.5);

        const movementSquares = this.add.graphics({ lineStyle: { width: 2, color: 0x888888, alpha: 0.7 } });
        for (const colX of this.playerColumns) {
            const topLeftX = colX - (this.SQUARE_SIZE / 2);
            const topLeftY = playerY - (this.SQUARE_SIZE / 2);
            movementSquares.strokeRect(topLeftX, topLeftY, this.SQUARE_SIZE, this.SQUARE_SIZE);
        }
        
        this.enemyProjectiles = this.physics.add.group({ classType: Projectile, runChildUpdate: true });
        this.playerProjectiles = this.physics.add.group({ classType: Projectile, runChildUpdate: true });

        this.physics.add.overlap(this.player, this.enemyProjectiles, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.enemy, this.playerProjectiles, this.handleEnemyHit, null, this);

        this.scene.launch('HUDScene');
    }

    update() {
        this.player.update();
        this.enemy.update();
        this.events.emit('updateUI', { health: this.player.getHealth(), stamina: this.player.getStamina(), activeShield: this.player.getActiveShield(), enemyHealth: this.enemy.getHealth() });
    }

    handlePlayerHit(player, projectile) {
        if (player.getActiveShield() === projectile.projectileType) {
            this.reflectProjectile(player.x, player.y, projectile.projectileType);
            this.challengeTrackers.perfectBlocks++;
        } else {
            player.takeDamage(20);
            this.challengeTrackers.playerTookDamage = true;
        }
        projectile.destroy();
        if (player.getHealth().current <= 0) { this.endLevel(false); }
    }

    handleEnemyHit(enemy, projectile) {
        const baseDamage = 20;
        const itemDb = this.cache.json.get('itemDatabase');
        const bonusStats = GameDataManager.calculateTotalStats(itemDb);
        const damageReflectPercent = bonusStats.dmgReflect || 0;
        const bonusDamage = baseDamage * (damageReflectPercent / 100);
        const totalDamage = baseDamage + bonusDamage;
        enemy.takeDamage(totalDamage);
        projectile.destroy();
        if (enemy.getHealth().current <= 0) { this.endLevel(true); }
    }

    endLevel(didPlayerWin) {
        this.enemy.stopAttacking();
        this.enemyProjectiles.clear(true, true);
        this.playerProjectiles.clear(true, true);
        if (didPlayerWin) {
            const challengeResults = this.evaluateAndSaveChallenges();
            const lootResults = this.generateAndSaveLoot();
            this.events.emit('levelComplete', { challenges: challengeResults, loot: lootResults });
        } else {
            this.events.emit('gameOver');
        }
    }

    generateAndSaveLoot() {
        const lootResults = [];
        const lootTable = this.levelData.lootTable || [];
        for (const drop of lootTable) {
            if (Math.random() < drop.chance) {
                const quantity = Phaser.Math.Between(drop.minQty, drop.maxQty);
                const wasAdded = GameDataManager.addItemToInventory(drop.itemId, quantity);
                lootResults.push({ itemId: drop.itemId, quantity: quantity, wasAdded: wasAdded });
            }
        }
        return lootResults;
    }
    
    evaluateAndSaveChallenges() {
        const results = [];
        const elapsedTime = (this.time.now - this.challengeTrackers.startTime) / 1000;
        const finalStamina = this.player.getStamina();
        this.levelData.challenges.forEach((challenge, index) => {
            let completed = false;
            switch (challenge.type) {
                case 'noDamage': completed = (this.player.getHealth().current >= this.player.maxHealth); break;
                case 'timeLimit': completed = elapsedTime <= challenge.value; break;
                case 'highStamina': const staminaPercent = (finalStamina.current / finalStamina.max) * 100; completed = staminaPercent >= challenge.value; break;
            }
            if (completed) { const challengeId = `${this.levelId}_challenge_${index}`; GameDataManager.profile.challengeCompletions[challengeId] = true; }
            results.push({ description: challenge.description, completed: completed });
        });
        GameDataManager.saveProfile();
        return results;
    }

    reflectProjectile(x, y, type) {
        const reflected = this.playerProjectiles.get();
        if (reflected) {
            reflected.setTexture(`projectile_${type}`);
            reflected.projectileType = type;
            reflected.setPosition(x, y);
            // --- SCALE: Reflected Projectiles ---
            reflected.setScale(2);
            reflected.setActive(true);
            reflected.setVisible(true);
            const speed = 400;
            this.physics.moveToObject(reflected, this.enemy, speed);
        }
    }
}