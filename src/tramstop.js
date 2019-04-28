class TramStop {
    constructor(tile) {
        this.tile = tile;
        this.canvas = null;
    }

    draw(group) {
        if (this.canvas !== null) {
            group.removeChild(this.canvas);
            this.canvas.destroy();
        }

        if (group !== null) {
            this.canvas = new Phaser.Graphics(game, this.tile.imgX, this.tile.imgY);

            var heads = this.tile.getStraightTracks();
            for (var head of heads) {
                var p = this.tile.getClosestPointInLane(this.tile.x, this.tile.y, head, config.Stop.lane);
                p.x -= this.tile.imgX;
                p.y -= this.tile.imgY;

                var dx = Math.sin(head * Math.PI / 180) * 20;
                var dy = -Math.cos(head * Math.PI / 180) * 20;
                if (head === 120 || head === 300) {
                    p.x -= dx;
                    p.y -= dy;
                }

                dx = Math.sin(head * Math.PI / 180) * config.Stop.length;
                dy = -Math.cos(head * Math.PI / 180) * config.Stop.length;
                var ex = Math.sin((180 - head) * Math.PI / 180) * config.Stop.width;
                var ey = -Math.cos((180 - head) * Math.PI / 180) * config.Stop.width;

                this.canvas.beginFill(Phaser.Color.hexToRGB(config.Stop.color1));
                var p1 = new Phaser.Point(p.x + ex - dx, p.y + 1 + ey - dy);
                var p2 = new Phaser.Point(p.x + ex + dx, p.y + 1 + ey + dy);
                var p3 = new Phaser.Point(p.x - ex + dx, p.y + 1 - ey + dy);
                var p4 = new Phaser.Point(p.x - ex - dx, p.y + 1 - ey - dy);

                this.canvas.drawPolygon([p1, p2, p3, p4]);
                this.canvas.endFill();

                this.canvas.beginFill(Phaser.Color.hexToRGB(config.Stop.color2));
                p1 = new Phaser.Point(p.x + ex - dx, p.y - 1 + ey - dy);
                p2 = new Phaser.Point(p.x + ex + dx, p.y - 1 + ey + dy);
                p3 = new Phaser.Point(p.x - ex + dx, p.y - 1 - ey + dy);
                p4 = new Phaser.Point(p.x - ex - dx, p.y - 1 - ey - dy);

                this.canvas.drawPolygon([p1, p2, p3, p4]);
                this.canvas.endFill();
            }

            group.add(this.canvas);
        }
    }
};
