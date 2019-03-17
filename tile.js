class Tile {
    constructor(game, fileId, x, y) {
        this.fileId = fileId;
        this.imgX = x;
        this.imgY = y;
        this.x = this.imgX + Math.floor(config.Tile.width/2);
        this.y = this.imgY + Math.floor(config.Tile.height/2);
        this.neighbours = [];
        this.streetNeighbours = [];
        this.neighbourConnections = {};
        this.connections = [];
        this.trees = null;
        this.cars = [];
    }

    updateImage(fileId) {
        this.fileId = fileId;
        var image = game.cache.getImage(this.fileId);
        this.imgY = this.imgY + config.Tile.imgHeight - image.height;
    }

    draw(game, group) {
        group.add(game.add.sprite(this.imgX, this.imgY, this.fileId));
        if (this.trees !== null) {
            this.trees.draw(game, group);
        }
        this.cars.forEach(function (car) {
            car.draw(game, group);
        });
    }

    update() {
        this.cars.forEach(function (car) {
            car.update();
        });
    }

    isGrass() {
        return this.fileId === 'g0000';
    }

    isStreet() {
        return this.fileId.startsWith('r');
    }

    isStraight() {
        return config.Street.straights.indexOf(this.fileId) >= 0;
    }

    isHighway() {
        return config.Street.highways.indexOf(this.fileId) >= 0;
    }

    isStraightOrCurve() {
        return this.connections.length == 2;
    }

    generateHouse(houseImages) {
        if (!this.isGrass()) {
            return;
        }

        var atStreet = false;
        for (var i = 0; i < this.neighbours.length; i++) {
            if (this.neighbours[i].isStreet() && !this.neighbours[i].isHighway()) {
                atStreet = true;
                break;
            }
        }

        if (atStreet && Math.random() < config.Tile.probHouse) {
            var houseImage = houseImages[Math.floor(Math.random() * houseImages.length)];
            this.updateImage(houseImage);
        }
    }

    generateTrees(treeImages) {
        if (this.isGrass()) {
            this.trees = new Trees(this, treeImages);
            this.trees.generateTrees();
        }
    }

    generateCars(carImages) {
        if (this.isStreet() && this.isStraight() && !this.isHighway()) {
            this.cars.push(new Car(this, carImages));
        }
    }

    computeAllNeighbours(tiles) {
        var buf = 10;
        for (var i = 0; i < tiles.length; i++) {
            if (this.x !== tiles[i].x && this.y !== tiles[i].y) {
                if (this.x + buf < tiles[i].x && tiles[i].x < this.x + config.Tile.width - buf
                    && this.y - config.Tile.height + buf < tiles[i].y && tiles[i].y < this.y - buf) {
                    this.neighbours.push(tiles[i]);
                } else if (this.x + buf < tiles[i].x && tiles[i].x < this.x + config.Tile.width - buf
                    && this.y + buf < tiles[i].y && tiles[i].y < this.y + config.Tile.height - buf) {
                    this.neighbours.push(tiles[i]);
                } else if (this.x - config.Tile.width + buf < tiles[i].x && tiles[i].x < this.x - buf
                    && this.y + buf < tiles[i].y && tiles[i].y < this.y + config.Tile.height - buf) {
                    this.neighbours.push(tiles[i]);
                } else if (this.x - config.Tile.width + buf < tiles[i].x && tiles[i].x < this.x - buf
                    && this.y - config.Tile.height + buf < tiles[i].y && tiles[i].y < this.y - buf) {
                    this.neighbours.push(tiles[i]);
                }
            }
        }
    }

    computeStreetNeighbours(tiles) {
        if (this.connections.length == 0) {
            return;
        }

        for (var i = 0; i < this.neighbours.length; i++) {
            var tile = this.neighbours[i];
            if (tile.isStreet()) {
                var direction = null;

                if (tile.x > this.x && tile.y < this.y) {
                    if (this.connections.indexOf(60) >= 0) {
                        direction = 60;
                    }
                } else if (tile.x > this.x && tile.y > this.y) {
                    if (this.connections.indexOf(120) >= 0) {
                        direction = 120;
                    }
                } else if (tile.x < this.x && tile.y > this.y) {
                    if (this.connections.indexOf(240) >= 0) {
                        direction = 240;
                    }
                } else if (tile.x < this.x && tile.y < this.y) {
                    if (this.connections.indexOf(300) >= 0) {
                        direction = 300;
                    }
                }

                if (direction !== null) {
                    if (!this.isStraightOrCurve() && !tile.isStraightOrCurve()) {
                        error('Cannot handle neighbouring junctions, crossings, or dead ends.', this, null);
                    }
                    this.streetNeighbours.push(tile);
                    this.neighbourConnections[tile] = direction;
                }
            }
        }
    }

    computeStreetConnections() {
        var id = parseInt(this.fileId.substring(1,5));
        if ([1, 5, 9, 21, 45, 49, 53, 77, 85].indexOf(id) >= 0) {
            this.connections.push(300);
        }
        if ([5, 9, 13, 17, 45, 53, 57, 65, 81].indexOf(id) >= 0) {
            this.connections.push(60);
        }
        if ([1, 9, 13, 21, 45, 57, 61, 69, 85].indexOf(id) >= 0) {
            this.connections.push(120);
        }
        if ([1, 5, 13, 17, 45, 49, 61, 73, 81].indexOf(id) >= 0) {
            this.connections.push(240);
        }
    }

    inside(x, y, factor) {
        factor = (typeof factor === 'undefined') ? 1.0 : factor;
        var xx = this.x - x;
        var yy = this.y - y;
        var ratio = config.Tile.width / config.Tile.height;
        return Math.abs(xx + ratio*yy) < factor * config.Tile.width * 0.5 && Math.abs(xx - ratio*yy) < factor * config.Tile.width * 0.5;
    }

    getRandomConnection() {
        if (this.connections.length > 0) {
            return this.connections[Math.floor(Math.random() * this.connections.length)];
        }
        error('Empty connection list', this, null);
    }

    getLane(head, lane) {
        var nx = Math.cos(head * Math.PI/180);
        var ny = Math.sin(head * Math.PI/180);
        var px = this.x;
        var py = this.y;

        if (head == 60 || head == 120) {
            py += config.Tile.height / lane;
        } else {
            py -= config.Tile.height / lane;
        }
        return {nx: nx, ny: ny, px: px, py: py};
    }

    distanceToLane(x, y, head, lane) {
        var laneVectors = this.getLane(head, lane);
        var fx = laneVectors.nx**2 * laneVectors.px + laneVectors.ny**2 * x + laneVectors.nx * laneVectors.ny * (laneVectors.py - y);
        var fy = laneVectors.ny**2 * laneVectors.py + laneVectors.nx**2 * y + laneVectors.nx * laneVectors.ny * (laneVectors.px - x);
        return Math.sqrt((x-fx)**2 + (y-fy)**2);
    }

    addCar(car) {
        this.cars.push(car);
    }

    removeCar(car) {
        var index = this.cars.indexOf(car);
        if (index >= 0) {
            this.cars.splice(index, 1);
        }
    }
}
