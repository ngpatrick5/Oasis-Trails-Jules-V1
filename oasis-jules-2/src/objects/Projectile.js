class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.projectileType = null;
    }

    fire(startX, startY, type) {
        this.setPosition(startX, startY);
        this.projectileType = type;

        this.setScale(2);

        this.body.setSize(this.width * 0.5, this.height * 0.5);
        this.setActive(true);
        this.setVisible(true);

        const speed = 400;
        this.setVelocity(0, speed);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.y > this.scene.uiBoundaryY) {
            this.destroy();
        }
    }
}
