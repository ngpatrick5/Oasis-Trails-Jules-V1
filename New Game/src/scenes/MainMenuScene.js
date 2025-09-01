class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // --- 1. Draw the Background Image ---
        this.add.image(centerX, centerY, 'title_background');
        
        // --- 2. Draw the Game Logo ---
        const logo = this.add.image(centerX, this.scale.height * 0.3, 'title_logo');

        // --- SCALE: Game Logo ---
        // To change the logo's size on the title screen, modify this number.
        logo.setScale(0.4);

        // --- 3. Create the Buttons ---
        const playButton = this.add.bitmapText(centerX, this.scale.height * 0.55, 'main_font', 'Play', 12).setOrigin(0.5);
        playButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.scene.start('LevelSelectScene'); });

        const howToPlayButton = this.add.bitmapText(centerX, this.scale.height * 0.70, 'main_font', 'How to Play', 12).setOrigin(0.5);
        howToPlayButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.createHowToPlayPopup(); });

        const resetButton = this.add.bitmapText(centerX, this.scale.height * 0.85, 'main_font', 'Reset Profile', 12).setOrigin(0.5);
        resetButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            if (confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
                GameDataManager.resetProfile();
                const feedbackText = this.add.bitmapText(centerX, this.scale.height * 0.9, 'main_font', 'Profile Reset!', 8).setOrigin(0.5);
                this.time.delayedCall(2000, () => feedbackText.destroy());
            }
        });
    }

    createHowToPlayPopup() {
        const popupContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        popupContainer.setDepth(100);
        const overlay = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.75 } });
        overlay.fillRect(-this.scale.width / 2, -this.scale.height / 2, this.scale.width, this.scale.height);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height), Phaser.Geom.Rectangle.Contains).on('pointerdown', () => popupContainer.destroy());
        const panelWidth = this.scale.width * 0.9;
        const panelHeight = this.scale.height * 0.6;
        const panel = this.add.graphics({ fillStyle: { color: 0x111111 }, lineStyle: { width: 1, color: 0xffffff } });
        panel.fillRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight);
        panel.strokeRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight);
        const textContent = `--- HOW TO PLAY ---\n\n` + `Use LEFT and RIGHT ARROW keys to move between the three columns.\n\n` + `Press '1', '2', or '3' to equip the matching shield (Green, Blue, or Red).\n\n` + `Equipping a shield drains PRAYER (stamina). Match the shield to an incoming projectile to reflect it back at the enemy.\n\n` + `Defeat the enemy in each level and complete challenges for bonus rewards!\n\n` + `(Click anywhere to close)`;
        const helpText = this.add.bitmapText(0, 0, 'main_font', textContent, 8).setOrigin(0.5).setCenterAlign().setMaxWidth(panelWidth - 20);
        popupContainer.add([overlay, panel, helpText]);
    }
}