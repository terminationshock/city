class Tile {
    constructor(fileId, x, y) {
        this.hash = generateRandomId();
        this.fileId = fileId;
        this.imgX = x;
        this.imgY = y;
        this.x = this.imgX + Math.floor(config.Tile.width/2);
        this.y = this.imgY + Math.floor(config.Tile.height/2);
        this.neighbours = [];
        this.streetNeighbours = [];
        this.neighbourConnections = {};
        this.connections = [];
        this.track = {};
        this.trees = null;
        this.cars = [];
        this.carHashes = [];
    }

    updateImage(fileId) {
        this.fileId = fileId;
        var image = game.cache.getImage(this.fileId);
        this.imgY = this.imgY + config.Tile.height - image.height;
    }

    draw(masterGroup, rowGroupGround, rowGroupHouses) {
        if (this.isGrass() || this.isStreet()) {
            rowGroupGround.add(game.add.image(this.imgX, this.imgY, this.fileId));
        } else {
            rowGroupHouses.add(game.add.image(this.imgX, this.imgY, this.fileId));
        }
        this.drawTrackPoints(rowGroupGround);

        if (this.trees !== null) {
            this.trees.draw(rowGroupHouses);
        }
        this.cars.forEach(function (car) {
            car.draw(masterGroup);
        });
    }

    drawTrackPoints(group) {
        if (this.hasTrack()) {
            var canvas = new Phaser.Graphics(game, 0, 0);
            canvas.lineStyle(1, Phaser.Color.hexToRGB(config.Track.color), 1);

            for (var headFrom in this.track) {
                var headTo = this.track[headFrom];
                headFrom = convertInt(headFrom) + 180;
                if (headFrom >= 360) {
                    headFrom -= 360;
                }

                for (var j = -1; j <= 1; j += 2) {
                    var p1 = this.getLaneStartPoint(headFrom, config.Street.laneDrive + j*config.Track.width/2, config.Track.lanePointFactor);
                    var p2 = this.getLaneTargetPoint(headTo, config.Street.laneDrive + j*config.Track.width/2, config.Track.lanePointFactor);

                    if (headFrom === headTo) {
                        canvas.moveTo(p1.x, p1.y);
                        canvas.lineTo(p2.x, p2.y);
                    } else {
                        var curve = this.getCurve(p1, p2, headFrom, headTo, config.Track.bezierFactor);
                        var path = curve.getPath(config.Track.curveFactor);

                        canvas.moveTo(p1.x, p1.y);
                        canvas.lineTo(path[0].x, path[0].y);
                        for (var i = 1; i < path.length; i++) {
                            canvas.lineTo(path[i].x, path[i].y);
                        }
                        canvas.lineTo(p2.x, p2.y);
                    }
                }
            }

            group.add(canvas);
        }
    }

    equals(other) {
        return this.hash === other.hash;
    }

    update() {
        this.cars.forEach(function (car) {
            car.update();
        });
    }

    isGrass() {
        return this.fileId === config.Tile.grass;
    }

    isStreet() {
        return this.fileId.startsWith(config.Tile.streetPrefix);
    }

    isStraight() {
        return config.Street.straights.includes(this.fileId);
    }

    isHighway() {
        return config.Street.highways.includes(this.fileId);
    }

    isStraightOrCurve() {
        return this.connections.length === 2;
    }

    isJunctionOrCrossing() {
        return this.connections.length > 2;
    }

    isDeadEnd() {
        return this.connections.length === 1;
    }

    hasTrack() {
        return Object.keys(this.track).length > 0;
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
            if (Math.random() < config.Tile.probCar) {
                this.addCar(new Car(this, carImages, config.Car.numTypes, false));
            }
        }
    }

    generateTrack(track) {
        var indices = [];
        var index = track.indexOf(this.hash);
        while (index != -1) {
            indices.push(index);
            index = track.indexOf(this.hash, index + 1);
        }

        for (var i = 0; i < indices.length; i++) {
            var indexNext = indices[i] + 1;
            var indexPrev = indices[i] - 1;
            if (indexNext === track.length) {
                indexNext = 0;
            }
            if (indexPrev === -1) {
                indexPrev = track.length - 1;
            }

            var headTo = this.neighbourConnections[track[indexNext]];
            var negativeHeadFrom = this.neighbourConnections[track[indexPrev]];
            this.track[negativeHeadFrom] = headTo;
        }
        return this.hasTrack() && this.isStraight();
    }

    computeAllNeighbours(tiles) {
        var buf = 10;
        for (var i = 0; i < tiles.length; i++) {
            if (!this.equals(tiles[i])) {
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
        if (this.connections.length === 0) {
            return;
        }

        for (var i = 0; i < this.neighbours.length; i++) {
            var tile = this.neighbours[i];
            if (tile.isStreet()) {
                var direction = null;

                if (tile.x > this.x && tile.y < this.y) {
                    if (this.connections.includes(convertInt(60))) {
                        direction = 60;
                    }
                } else if (tile.x > this.x && tile.y > this.y) {
                    if (this.connections.includes(convertInt(120))) {
                        direction = 120;
                    }
                } else if (tile.x < this.x && tile.y > this.y) {
                    if (this.connections.includes(convertInt(240))) {
                        direction = 240;
                    }
                } else if (tile.x < this.x && tile.y < this.y) {
                    if (this.connections.includes(convertInt(300))) {
                        direction = 300;
                    }
                }

                if (direction !== null) {
                    if (!this.isStraightOrCurve() && !tile.isStraightOrCurve()) {
                        error('Cannot handle neighbouring junctions, crossings, or dead ends.', this, null);
                    }
                    this.streetNeighbours.push(tile);
                    this.neighbourConnections[tile.hash] = convertInt(direction);
                }
            }
        }
    }

    getNeighbourConnection(tile) {
        return this.neighbourConnections[tile.hash];
    }

    computeStreetConnections() {
        var id = parseInt(this.fileId.substring(1,5));
        if ([1, 5, 9, 21, 45, 49, 53, 77, 85].includes(id)) {
            this.connections.push(300);
        }
        if ([5, 9, 13, 17, 45, 53, 57, 65, 81].includes(id)) {
            this.connections.push(60);
        }
        if ([1, 9, 13, 21, 45, 57, 61, 69, 85].includes(id)) {
            this.connections.push(120);
        }
        if ([1, 5, 13, 17, 45, 49, 61, 73, 81].includes(id)) {
            this.connections.push(240);
        }
        this.connections.forEach(convertInt);
    }

    getCurve(p1, p2, head1, head2, bezierFactor) {
        var turn = this.getTurnDirection(head1, head2);

        var dx1 = Math.sin(head1 * Math.PI/180);
        var dy1 = -Math.cos(head1 * Math.PI/180);

        var dx2 = Math.sin(head2 * Math.PI/180);
        var dy2 = -Math.cos(head2 * Math.PI/180);

        var deltaHead = 0;
        if (turn < 0) {
            if (head2 > head1) {
                deltaHead = head1 - (head2 - 360);
            } else {
                deltaHead = head1 - head2;
            }
        } else if (turn > 0) {
            if (head2 < head1) {
                deltaHead = (head2 + 360) - head1;
            } else {
                deltaHead = head2 - head1;
            }
        }

        var bezierFactor = bezierFactor * deltaHead;
        if (deltaHead === 0) {
            return new BezierCurve([p1, p2]);
        }
        return new BezierCurve([p1,
                                new Point(p1.x + bezierFactor*dx1, p1.y + bezierFactor*dy1),
                                new Point(p2.x - bezierFactor*dx2, p2.y - bezierFactor*dy2),
                                p2]);
    }

    getTurnDirection(fromHead, toHead) {
        if (0 < toHead-fromHead && toHead-fromHead < 180) {
            return 1;
        } else if (-180 <= toHead-fromHead && toHead-fromHead < 0) {
            return -1;
        } else if (toHead-fromHead >= 180) {
            return -1;
        } else if (-180 > toHead-fromHead) {
            return 1;
        }
        return 0;
    }

    inside(x, y, factor) {
        factor = (typeof factor === 'undefined') ? 1.0 : factor;
        var xx = this.x - x;
        var yy = this.y - y;
        var ratio = config.Tile.width / config.Tile.height;
        return Math.abs(xx + ratio*yy) < factor * config.Tile.width * 0.5 && Math.abs(xx - ratio*yy) < factor * config.Tile.width * 0.5;
    }

    nearCenter(x, y) {
        return this.inside(x, y, config.Street.centerSizeFactor);
    }

    centerAhead(x, head) {
        if (0 < head && head < 180) {
            return x < this.x;
        }
        return x > this.x;
    }

    getRandomConnection(bindToTrack) {
        if (this.connections.length > 0) {
            if (bindToTrack && this.hasTrack()) {
                var connections = Object.keys(this.track);
                return this.track[connections[Math.floor(Math.random() * connections.length)]];
            }
            return this.connections[Math.floor(Math.random() * this.connections.length)];
        }
        error('Empty connection list', this, null);
    }

    getLane(head, lane) {
        var nx = Math.cos(head * Math.PI/180);
        var ny = Math.sin(head * Math.PI/180);
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

    getLaneTargetPoint(head, lane, factor) {
        var dist = factor * config.Tile.width;
        var x = this.x + Math.sin(head * Math.PI/180) * dist;
        var y = this.y - Math.cos(head * Math.PI/180) * dist;
        return this.getClosestPointInLane(x, y, head, lane);
    }

    getLaneStartPoint(head, lane, factor) {
        var dist = factor * config.Tile.width;
        var x = this.x - Math.sin(head * Math.PI/180) * dist;
        var y = this.y + Math.cos(head * Math.PI/180) * dist;
        return this.getClosestPointInLane(x, y, head, lane);
    }

    addCar(car) {
        this.cars.splice(1, 0, car);
        this.carHashes.splice(1, 0, car.hash);
    }

    removeCar(car) {
        var index = this.carHashes.indexOf(car.hash);
        if (index >= 0) {
            this.cars.splice(index, 1);
            this.carHashes.splice(index, 1);
        }
    }

    getCarIndex(car) {
        return this.carHashes.indexOf(car.hash);
    }

    hasFreeParkingLot(head) {
        if (!this.isStraight()) {
            return false;
        }
        if (this.isHighway()) {
            return false;
        }
        if (!this.connections.includes(convertInt(head))) {
            return false;
        }
        for (var i = 0; i < this.cars.length; i++) {
            if (this.cars[i].isParking() && this.cars[i].getHead() === convertInt(head)) {
                return false;
            }
        }
        return true;
    }
}
