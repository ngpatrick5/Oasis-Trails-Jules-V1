class ItemTooltip {
    constructor(scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(200);
        this.container.setVisible(false);

        this.background = scene.add.graphics();
        this.text = scene.add.bitmapText(0, 0, 'main_font', '', 8);

        this.container.add([this.background, this.text]);
    }

    show(x, y, itemData, actionText) {
        let content = `${itemData.name}\n\n`;

        if (itemData.stats) {
            for (const [stat, value] of Object.entries(itemData.stats)) {
                const formattedStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                content += `${formattedStat}: ${value > 0 ? '+' : ''}${value}\n`;
            }
        }

        content += `\nAction: ${actionText}`;
        content += `\nValue: ${itemData.value}`;

        this.text.setText(content);

        const padding = 5;
        const textWidth = this.text.width;
        const textHeight = this.text.height;

        this.background.clear();
        this.background.fillStyle(0x000000, 0.85);
        this.background.lineStyle(1, 0xffffff, 0.5);
        this.background.strokeRect(-padding, -padding, textWidth + padding * 2, textHeight + padding * 2);
        this.background.fillRect(-padding, -padding, textWidth + padding * 2, textHeight + padding * 2);

        this.text.setPosition(0, 0);

        this.container.setPosition(x + 10, y + 10);
        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }
}
