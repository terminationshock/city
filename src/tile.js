class Tile {
    constructor(fileId, hash, x, y) {
        this.fileId = fileId;
        this.hash = hash;
        this.imgX = x;
        this.imgY = y;
        this.x = this.imgX + Math.floor(config.Tile.width / 2);
        this.y = this.imgY + Math.floor(config.Tile.height / 2);
        this.neighbours = [];
        this.streetNeighbours = [];
        this.neighbourConnections = {};
        this.trees = null;
        this.vehicles = [];
        this.vehicleHashes = [];
    }

    updateImage(fileId) {
        this.fileId = fileId;
        var image = game.cache.getImage(this.fileId);
        this.imgY = this.imgY + config.Tile.height - image.height;
    }

    draw(rowGroupGround, rowGroupHouses) {
        if (this.isGrass() || this.isStreet()) {
            rowGroupGround.add(game.add.image(this.imgX, this.imgY, this.fileId));
        } else {
            rowGroupHouses.add(game.add.image(this.imgX, this.imgY, this.fileId));
        }

        if (this.trees !== null) {
            this.trees.draw(rowGroupHouses);
        }
    }

    drawVehicles(group) {
        this.vehicles.forEach(vehicle => vehicle.draw(group));
    }

    equals(other) {
        if (other === null) {
            return false;
        }
        return this.hash === other.hash;
    }

    equalsHash(hash) {
        return this.hash === hash;
    }

    update() {
        this.vehicles.forEach(vehicle => vehicle.update());
    }

    isGrass() {
        return this.fileId === config.Tile.grass;
    }

    isStreet() {
        return this.fileId.startsWith(config.Tile.streetPrefix);
    }

    isHouse() {
        return !this.isGrass() && !this.isStreet();
    }

    isStraight() {
        return config.Street.straights.includes(this.fileId);
    }

    isHighway() {
        return config.Street.highways.includes(this.fileId);
    }

    isCurve() {
        return config.Street.curves.includes(this.fileId);
    }

    isStraightOrCurve() {
        return this.isStraight() || this.isCurve();
    }

    isDeadEnd() {
        return config.Street.deadEnds.includes(this.fileId);
    }

    isDeadEndOrJunctionOrCrossing() {
        if (this.isDeadEnd()) {
            return true;
        }
        if (!this.isStraightOrCurve() && !this.isGrass()) {
            return true;
        }
        return false;
    }

    generateHouse(houseImages) {
        if (!this.isGrass()) {
            return;
        }

        var atStreet = false;
        for (var neighbour of this.neighbours) {
            if (neighbour.isStreet() && !neighbour.isHighway()) {
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
        if (this.isStreet()) {
            var connections = this.getStreetConnections();
            var head = connections[Math.floor(Math.random() * connections.length)];

            if (this.hasFreeParkingLot(head)) {
                if (Math.random() < config.Tile.probCar) {
                    this.addVehicle(new Car(this, head, carImages, config.Car.numTypes, null));
                }
            }
        }
    }

    computeAllNeighbours(tiles) {
        var buf = 10;
        for (var tile of tiles) {
            if (!this.equals(tile)) {
                if (this.x + buf < tile.x && tile.x < this.x + config.Tile.width - buf && this.y - config.Tile.height + buf < tile.y && tile.y < this.y - buf) {
                    this.neighbours.push(tile);
                } else if (this.x + buf < tile.x && tile.x < this.x + config.Tile.width - buf && this.y + buf < tile.y && tile.y < this.y + config.Tile.height - buf) {
                    this.neighbours.push(tile);
                } else if (this.x - config.Tile.width + buf < tile.x && tile.x < this.x - buf && this.y + buf < tile.y && tile.y < this.y + config.Tile.height - buf) {
                    this.neighbours.push(tile);
                } else if (this.x - config.Tile.width + buf < tile.x && tile.x < this.x - buf && this.y - config.Tile.height + buf < tile.y && tile.y < this.y - buf) {
                    this.neighbours.push(tile);
                }
            }
        }
    }

    computeStreetNeighboursAndConnections() {
        for (var tile of this.neighbours) {
            if (!tile.isHouse()) {
                var direction = null;

                if (tile.x > this.x && tile.y < this.y) {
                    direction = 60;
                } else if (tile.x > this.x && tile.y > this.y) {
                    direction = 120;
                } else if (tile.x < this.x && tile.y > this.y) {
                    direction = 240;
                } else if (tile.x < this.x && tile.y < this.y) {
                    direction = 300;
                }

                this.neighbourConnections[tile.hash] = convertInt(direction);
                if (tile.isStreet() && this.isConnectedTo(direction)) {
                    if (!this.isStraightOrCurve() && !tile.isStraightOrCurve()) {
                        error('Cannot handle neighbouring junctions, crossings, or dead ends.', this, null);
                    }
                    this.streetNeighbours.push(tile);
                }
            }
        }
    }

    getNeighbourConnection(tile) {
        var hash = tile;
        if (typeof tile !== 'string') {
            hash = tile.hash;
        }
        if (!(hash in this.neighbourConnections)) {
            return null;
        }
        return this.neighbourConnections[hash];
    }

    isConnectedTo(head) {
        var id = parseInt(this.fileId.substring(1, 5));
        if ([1, 5, 9, 21, 45, 49, 53, 77, 85].includes(id)) {
            if (convertInt(head) === 300) {
                return true;
            }
        }
        if ([5, 9, 13, 17, 45, 53, 57, 65, 81].includes(id)) {
            if (convertInt(head) === 60) {
                return true;
            }
        }
        if ([1, 9, 13, 21, 45, 57, 61, 69, 85].includes(id)) {
            if (convertInt(head) === 120) {
                return true;
            }
        }
        if ([1, 5, 13, 17, 45, 49, 61, 73, 81].includes(id)) {
            if (convertInt(head) === 240) {
                return true;
            }
        }
        return false;
    }

    getStreetConnections() {
        var heads = [60, 120, 240, 300];
        return heads.filter(head => this.isConnectedTo(head));
    }

    inside(x, y, factor) {
        factor = (typeof factor === 'undefined') ? 1.0 : factor;
        var xx = this.x - x;
        var yy = this.y - y;
        var ratio = config.Tile.width / config.Tile.height;
        return Math.abs(xx + ratio * yy) < factor * config.Tile.width * 0.5 && Math.abs(xx - ratio * yy) < factor * config.Tile.width * 0.5;
    }

    nearCenter(x, y) {
        return this.inside(x, y, config.Street.centerSizeFactor);
    }

    getLane(head, lane) {
        var nx = Math.cos(head * Math.PI / 180);
        var ny = Math.sin(head * Math.PI / 180);
        var px = this.x;
        var py = this.y;

        if (convertInt(head) === 60 || convertInt(head) === 120) {
            py += lane;
        } else {
            py -= lane;
        }
        return {nx: nx, ny: ny, px: px, py: py};
    }

    getClosestPointInLane(x, y, head, lane) {
        var laneVectors = this.getLane(head, lane);
        var fx = laneVectors.nx**2 * laneVectors.px + laneVectors.ny**2 * x + laneVectors.nx * laneVectors.ny * (laneVectors.py - y);
        var fy = laneVectors.ny**2 * laneVectors.py + laneVectors.nx**2 * y + laneVectors.nx * laneVectors.ny * (laneVectors.px - x);
        return new Point(fx, fy);
    }

    getDistanceToLane(x, y, head, lane) {
        var point = this.getClosestPointInLane(x, y, head, lane);
        return Math.sqrt((x - point.x)**2 + (y - point.y)**2);
    }

    getTileBoundaryPoint(x, y, head, lane) {
        var px = this.x;
        var py = this.y;
        if (convertInt(head) === 60 || convertInt(head) === 120) {
            py += lane;
            y += lane;
        } else {
            py -= lane;
            y -= lane;
        }
        var ray = new Phaser.Line(px, py, x, y);
        var line = null;
        for (var h of [60, 120, 240, 300]) {
            switch (h) {
                case 60:
                    line = new Phaser.Line(this.x, this.y-config.Tile.height/2, this.x+config.Tile.width/2, this.y);
                    break;
                case 120:
                    line = new Phaser.Line(this.x, this.y+config.Tile.height/2, this.x+config.Tile.width/2, this.y);
                    break;
                case 240:
                    line = new Phaser.Line(this.x, this.y+config.Tile.height/2, this.x-config.Tile.width/2, this.y);
                    break;
                case 300:
                    line = new Phaser.Line(this.x, this.y-config.Tile.height/2, this.x-config.Tile.width/2, this.y);
                    break;
            }
            var point = Phaser.Line.intersects(ray, line)
            if (point !== null) {
                return point;
            }
        }
        return null;
    }

    getLaneTargetPoint(head, lane, factor) {
        var dist = factor * config.Tile.width;
        var x = this.x + Math.sin(head * Math.PI/180) * dist;
        var y = this.y - Math.cos(head * Math.PI/180) * dist;
        if (factor >= 1) {
            return this.getTileBoundaryPoint(x, y, head, lane);
        }
        return this.getClosestPointInLane(x, y, head, lane);
    }

    addVehicle(vehicle) {
        this.vehicles.push(vehicle);
        this.vehicleHashes.push(vehicle.hash);
    }

    removeVehicle(vehicle) {
        var index = this.vehicleHashes.indexOf(vehicle.hash);
        if (index >= 0) {
            this.vehicles.splice(index, 1);
            this.vehicleHashes.splice(index, 1);
        }
    }

    getVehicleIndex(vehicle) {
        return this.vehicleHashes.indexOf(vehicle.hash);
    }

    hasFreeParkingLot(head) {
        if (!this.isStraight()) {
            return false;
        }
        if (this.isHighway()) {
            return false;
        }
        if (this.isDeadEndOrJunctionOrCrossing()) {
            return false;
        }
        if (!this.isConnectedTo(head)) {
            return false;
        }
        for (var vehicle of this.vehicles) {
            if (vehicle.isParking() && vehicle.getHead() === convertInt(head)) {
                return false;
            }
        }
        return true;
    }
};
