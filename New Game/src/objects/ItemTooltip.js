// This is a reusable UI component for displaying item tooltips.
class ItemTooltip {
    /**
     * @param {Phaser.Scene} scene - The scene to create the tooltip in.
     */
    constructor(scene) {
        this.scene = scene;
        // The container holds all the visual elements of the tooltip.
        this.container = scene.add.container(0, 0);
        this.container.setDepth(200); // Ensures it appears on top of other UI.
        this.container.setVisible(false); // It's hidden by default.

        // Create the visual components of the tooltip.
        this.background = scene.add.graphics();
        this.text = scene.add.bitmapText(0, 0, 'main_font', '', 8);
        
        this.container.add([this.background, this.text]);
    }

    /**
     * Shows the tooltip with details for a specific item.
     * @param {number} x - The x-coordinate to show the tooltip at.
     * @param {number} y - The y-coordinate to show the tooltip at.
     * @param {object} itemData - The full item data from items.json.
     * @param {string} actionText - The text to display for the action (e.g., "Equip", "Unequip").
     */
    show(x, y, itemData, actionText) {
        // --- Build the tooltip content string ---
        let content = `${itemData.name}\n\n`;

        // Add stats if they exist.
        if (itemData.stats) {
            for (const [stat, value] of Object.entries(itemData.stats)) {
                // This converts stat names like 'maxHP' to 'Max HP' for display.
                const formattedStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                content += `${formattedStat}: ${value > 0 ? '+' : ''}${value}\n`;
            }
        }
        
        // Add action text and value.
        content += `\nAction: ${actionText}`;
        content += `\nValue: ${itemData.value}`;

        this.text.setText(content);

        // --- Recalculate background size and position ---
        const padding = 5;
        const textWidth = this.text.width;
        const textHeight = this.text.height;

        this.background.clear();
        this.background.fillStyle(0x000000, 0.85); // Made slightly more opaque.
        this.background.lineStyle(1, 0xffffff, 0.5); // Added a white border.
        this.background.strokeRect(-padding, -padding, textWidth + padding * 2, textHeight + padding * 2);
        this.background.fillRect(-padding, -padding, textWidth + padding * 2, textHeight + padding * 2);

        this.text.setPosition(0, 0);
        
        // Position the whole container. We add a small offset so the cursor isn't directly on top of it.
        this.container.setPosition(x + 10, y + 10);
        this.container.setVisible(true);
    }

    /**
     * Hides the tooltip.
     */
    hide() {
        this.container.setVisible(false);
    }
}