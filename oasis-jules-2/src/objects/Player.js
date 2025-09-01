class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture) {
        super(scene, x, y);
        scene.physics.add.existing(this);
        this.body.setSize(60, 60);
        this.playerSprite = scene.add.sprite(0, 0, texture);
        this.shieldIndicator = scene.add.graphics();
        this.add([this.playerSprite, this.shieldIndicator]);
        scene.add.existing(this);

        const baseStats = {
            health: 100,
            stamina: 100,
            staminaRegen: 1,
            healthRegen: 0
        };

        const itemDb = scene.cache.json.get('itemDatabase');
        const bonusStats = GameDataManager.calculateTotalStats(itemDb);

        this.maxHealth = baseStats.health + (bonusStats.maxHP || 0);
        this.maxStamina = baseStats.stamina + (bonusStats.maxStam || 0);
        this.staminaRegenRate = baseStats.staminaRegen + (bonusStats.regenStam || 0);
        this.healthRegenRate = baseStats.healthRegen + (bonusStats.regenHP || 0);

        this.health = this.maxHealth;
        this.stamina = this.maxStamina;

        this.currentColumn = 1;
        this.columns = scene.playerColumns;
        this.activeShield = null;
        this.shieldColors = { range: 0x00ff00, magic: 0x3399ff, melee: 0xff0000 };
        this.staminaDrainRate = 15;

        this.keyLeft = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    }

    update() {
        this.handleMovement();
        this.handleShieldInput();
        this.handleStamina();
        this.handleHealthRegen();
        this.updateShieldVisual();
    }

    handleHealthRegen() {
        if (this.healthRegenRate > 0 && this.health < this.maxHealth) {
            const deltaSeconds = this.scene.game.loop.delta / 1000;
            this.health += this.healthRegenRate * deltaSeconds;
            this.health = Phaser.Math.Clamp(this.health, 0, this.maxHealth);
        }
    }

    updateShieldVisual() {
        this.shieldIndicator.clear();
        if (this.activeShield) {
            const color = this.shieldColors[this.activeShield];
            const radius = 40;
            const startAngle = Phaser.Math.DegToRad(180);
            const endAngle = Phaser.Math.DegToRad(360);
            this.shieldIndicator.fillStyle(color, 0.4);
            this.shieldIndicator.beginPath();
            this.shieldIndicator.moveTo(0, 0);
            this.shieldIndicator.arc(0, 0, radius, startAngle, endAngle);
            this.shieldIndicator.closePath();
            this.shieldIndicator.fillPath();
        }
    }

    handleMovement() {
        if (Phaser.Input.Keyboard.JustDown(this.keyLeft) && this.currentColumn > 0) {
            this.currentColumn--;
            this.x = this.columns[this.currentColumn];
        } else if (Phaser.Input.Keyboard.JustDown(this.keyRight) && this.currentColumn < 2) {
            this.currentColumn++;
            this.x = this.columns[this.currentColumn];
        }
    }

    handleShieldInput() {
        if (Phaser.Input.Keyboard.JustDown(this.key1)) this.toggleShield('range');
        if (Phaser.Input.Keyboard.JustDown(this.key2)) this.toggleShield('magic');
        if (Phaser.Input.Keyboard.JustDown(this.key3)) this.toggleShield('melee');
    }

    toggleShield(type) {
        if (this.activeShield === type) {
            this.activeShield = null;
        } else {
            this.activeShield = type;
        }
    }

    handleStamina() {
        const deltaSeconds = this.scene.game.loop.delta / 1000;
        if (this.activeShield && this.stamina > 0) {
            this.stamina -= this.staminaDrainRate * deltaSeconds;
        } else if (!this.activeShield && this.stamina < this.maxStamina) {
            this.stamina += this.staminaRegenRate * deltaSeconds;
        }
        this.stamina = Phaser.Math.Clamp(this.stamina, 0, this.maxStamina);
        if (this.stamina <= 0) {
            this.activeShield = null;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);
    }

    getHealth() { return { current: this.health, max: this.maxHealth }; }
    getStamina() { return { current: this.stamina, max: this.maxStamina }; }
    getActiveShield() { return this.activeShield; }
}
