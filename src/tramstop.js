class TramStop {
    constructor(tile) {
        this.tile = tile;
        this.canvas = null;
    }

    draw(group) {
        if (this.canvas !== null) {
            this.canvas.destroy();
        }
        return;

        this.canvas = new Phaser.Graphics(game, this.tile.imgX, this.tile.imgY);
        this.canvas.beginFill(Phaser.Color.hexToRGB('#FF0000'));
        this.canvas.drawPolygon();              
        this.canvas.endFill();
        group.add(this.canvas);
    }
};
