class Car {
    constructor(tile, carImages) {
        this.colorId = carImages[Math.floor(Math.random() * carImages.length)];
        this.typeId = Math.floor(Math.random() * config.Car.numTypes);
        this.group = null;
        this.startInParkingLot(tile);
    }

    startInParkingLot(tile) {
        this.v = 0;
        this.tile = tile;
        this.head = this.tile.getRandomConnection();
        this.fhead = this.head;
        var lane = this.tile.getLane(this.head, config.Street.lanePark);
        this.x = this.tile.x;
        if (this.head == 60 || this.head == 300) {
            this.x += config.Tile.width / 4;
        } else {
            this.x -= config.Tile.width / 4;
        }
        this.y = (lane.nx * (lane.px-this.x) + lane.ny * lane.py) / lane.ny;
    }

    getFrameIndex() {
        var col = config.Car.headingOrder.indexOf(Math.round(this.head));
        if (col == -1) {
            throw 'Heading not in car sprite [238367a]';
        }
        return this.typeId * config.Car.headingOrder.length + col;
    }

    draw(game, tileGroup) {
        var x = Math.round(this.x - config.Car.imgSize/2);
        var y = Math.round(this.y - config.Car.imgSize/2);
        var sprite = game.add.sprite(x, y, this.colorId);
        sprite.frame = this.getFrameIndex();

        this.group = game.add.group();
        this.group.add(sprite);
    }
}
