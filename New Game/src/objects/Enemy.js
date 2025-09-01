class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, stats) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.health = 100;
        this.maxHealth = 100;
        
        // --- No changes needed here. The stats object, including our new properties, is saved. ---
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

        // This is the MAIN timer. It controls the pause BETWEEN full attack sequences.
        // Its only job is to call 'startAttackSequence' every 'attackDelay' milliseconds.
        this.attackTimer = scene.time.addEvent({
            delay: this.stats.attackDelay,
            callback: this.startAttackSequence,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * This function is the "manager" of an attack. It decides how many waves (groups)
     * of projectiles will be fired in this sequence and then sets up a new, temporary timer
     * to fire each of those waves.
     */
    startAttackSequence() {
        // First, determine how many groups to fire in this sequence based on the level's data.
        const numGroups = Phaser.Math.Between(this.stats.minGroups, this.stats.maxGroups);

        // If for some reason there are no groups to fire, we stop here.
        if (numGroups <= 0) {
            return;
        }

        // We use a new, temporary timer for the rapid-fire waves within the sequence.
        this.scene.time.addEvent({
            // The delay between each wave is read from our stats object.
            delay: this.stats.delayBetweenGroups,
            
            // This tells the timer how many times to repeat.
            // If numGroups is 3, it runs once immediately and then repeats 2 more times.
            repeat: numGroups - 1,
            
            // The function to call for each wave.
            callback: this.spawnProjectileGroup,
            
            // Ensures 'this' inside the callback refers to the Enemy object.
            callbackScope: this
        });
    }
    
    /**
     * This function is the "worker". Its only job is to spawn ONE wave (group) of projectiles.
     * It is called multiple times in quick succession by the timer in 'startAttackSequence'.
     */
    spawnProjectileGroup() {
        // This logic is the same as our old 'fireProjectile' function.
        const columns = this.scene.playerColumns;
        
        // Determine how many projectiles to spawn in THIS specific group.
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
      // This enemy is stationary.
    }
}