class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load Data Files
        this.load.json('config', 'data/config.json');
        this.load.json('levels', 'data/levels.json');
        this.load.json('itemDatabase', 'data/items.json');

        // Load Fonts
        this.load.bitmapFont('main_font', 'assets/fonts/font.png', 'assets/fonts/font.xml');

        // Load Core and Item Images
        this.load.image('player_real_image', 'assets/images/player_model.png');
        this.load.image('icon_sword', 'assets/images/icon_simple_sword.png');
        this.load.image('icon_helm', 'assets/images/icon_iron_helm.png');
        this.load.image('icon_log', 'assets/images/icon_oak_log.png');
        this.load.image('icon_scroll', 'assets/images/icon_scroll.png');

        // Load Title Screen and UI Assets
        this.load.image('title_background', 'assets/images/title_screen_bg.png');
        this.load.image('title_logo', 'assets/images/title_screen_logo.png');
        this.load.image('menu_bg_tile', 'assets/images/menu_bg_tile.png');
        this.load.image('menu_horizontal_bar', 'assets/images/menu_horizontal_bar.png');
        this.load.image('menu_vertical_column', 'assets/images/menu_vertical_column.png');
    }

    create() {
        GameDataManager.loadProfile();

        // Generate procedural graphics
        this.textures.generate('enemy_sprite', {
            data: ['................','......3333......','.....377773.....','....37676773....','...3767676773...','..377676767773..','..377777777773..','..333333333333..','..3.3.333.3.3..','..33.3.3.3.33..','.333........333.','3.3..........3.3','................','................','................','................'],
            palette: { 3: '#333', 7: '#ff0000', 6: '#cc0000' }, pixelWidth: 2
        });
        this.textures.generate('projectile_range', { data: ['..2..', '.222.', '22222', '.222.', '..2..', '..2..'], palette: { 2: '#00ff00' }, pixelWidth: 2 });
        this.textures.generate('projectile_magic', { data: ['.44.', '4444', '4444', '.44.'], palette: { 4: '#3399ff' }, pixelWidth: 2 });
        this.textures.generate('projectile_melee', { data: ['..5..', '..5..', '.555.', '.555.', '55555', '.5.5.'], palette: { 5: '#ff0000' }, pixelWidth: 2 });
        this.textures.generate('game_background', { data: ['.'], palette: { '.': '#2ecc71' }, pixelWidth: 240 });

        this.scene.start('MainMenuScene');
    }
}
