class TramStop {
    constructor(tile) {
        this.tile = tile;
        this.canvas = null;
    }

    draw(group) {
        if (this.canvas !== null) {
            this.canvas.destroy();
        }

        if (group !== null) {
            this.canvas = new Phaser.Graphics(game, this.tile.imgX, this.tile.imgY);

            for (var head of this.tile.getStraightTracks()) {
                var p = this.tile.getClosestPointInLane(this.tile.x, this.tile.y, head, config.Stop.lane);
                p.x -= this.tile.imgX;
                p.y -= this.tile.imgY;

                var dx = Math.sin(head * Math.PI / 180) * config.Stop.length;
                var dy = -Math.cos(head * Math.PI / 180) * config.Stop.length;
                var ex = Math.sin((180 - head) * Math.PI / 180) * config.Stop.width;
                var ey = -Math.cos((180 - head) * Math.PI / 180) * config.Stop.width;

                this.canvas.beginFill(Phaser.Color.hexToRGB(config.Stop.color1));
                var p1 = new Point(p.x + ex - dx, p.y + 1 + ey - dy);
                var p2 = new Point(p.x + ex + dx, p.y + 1 + ey + dy);
                var p3 = new Point(p.x - ex + dx, p.y + 1 - ey + dy);
                var p4 = new Point(p.x - ex - dx, p.y + 1 - ey - dy);

                this.canvas.drawPolygon([p1, p2, p3, p4]);
                this.canvas.endFill();

                this.canvas.beginFill(Phaser.Color.hexToRGB(config.Stop.color2));
                var p1 = new Point(p.x + ex - dx, p.y - 1 + ey - dy);
                var p2 = new Point(p.x + ex + dx, p.y - 1 + ey + dy);
                var p3 = new Point(p.x - ex + dx, p.y - 1 - ey + dy);
                var p4 = new Point(p.x - ex - dx, p.y - 1 - ey - dy);

                this.canvas.drawPolygon([p1, p2, p3, p4]);
                this.canvas.endFill();
            }

            group.add(this.canvas);
        }
    }
};
