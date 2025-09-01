class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, stats) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.health = 100;
        this.maxHealth = 100;

        const defaultStats = {
            attackDelay: 4000,
            minProjectiles: 1,
            maxProjectiles: 3,
            minGroups: 1,
            maxGroups: 1,
            delayBetweenGroups: 200
        };
        this.stats = stats || defaultStats;

        this.projectileTypes = ['range', 'magic', 'melee'];

        this.attackTimer = scene.time.addEvent({
            delay: this.stats.attackDelay,
            callback: this.startAttackSequence,
            callbackScope: this,
            loop: true
        });
    }

    startAttackSequence() {
        const numGroups = Phaser.Math.Between(this.stats.minGroups, this.stats.maxGroups);

        if (numGroups <= 0) {
            return;
        }

        this.scene.time.addEvent({
            delay: this.stats.delayBetweenGroups,
            repeat: numGroups - 1,
            callback: this.spawnProjectileGroup,
            callbackScope: this
        });
    }

    spawnProjectileGroup() {
        const columns = this.scene.playerColumns;
        const numToSpawn = Phaser.Math.Between(this.stats.minProjectiles, this.stats.maxProjectiles);

        let columnIndices = [0, 1, 2];
        Phaser.Math.RND.shuffle(columnIndices);
        const chosenIndices = columnIndices.slice(0, numToSpawn);

        for (const index of chosenIndices) {
            const spawnX = columns[index];
            const projectileType = Phaser.Math.RND.pick(this.projectileTypes);
            const projectile = this.scene.enemyProjectiles.get();

            if (projectile) {
                projectile.setTexture(`projectile_${projectileType}`);
                projectile.fire(spawnX, this.y, projectileType);
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);
    }

    stopAttacking() {
        if (this.attackTimer) {
            this.attackTimer.destroy();
        }
    }

    getHealth() { return { current: this.health, max: this.maxHealth }; }

    update() {
    }
}
