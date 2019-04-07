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
        this.newTrack = {};
        this.trackPoints = null;
        this.hover = null;
        this.trees = null;
        this.cars = [];
        this.carHashes = [];
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

    drawCars(group) {
        this.cars.forEach(function (car) {
            car.draw(group);
        });
    }

    drawTracks(group) {
        if (this.trackPoints !== null) {
            this.trackPoints.destroy();
        }

        if (this.hasTracks() || Object.keys(this.newTrack).length > 0) {
            this.trackPoints = new Phaser.Graphics(game, 0, 0);

            this.trackPoints.lineStyle(1, Phaser.Color.hexToRGB(config.Track.color), 1);
            for (var headFrom in this.track) {
                var headsTo = this.track[headFrom];
                for (var i = 0; i < headsTo.length; i++) {
                    this.addSingleTrack(headFrom, headsTo[i]);
                }
            }
            this.trackPoints.lineStyle(1, Phaser.Color.hexToRGB(config.Track.activeColor), 1);
            for (var headFrom in this.newTrack) {
                var headsTo = this.newTrack[headFrom];
                for (var i = 0; i < headsTo.length; i++) {
                    this.addSingleTrack(headFrom, headsTo[i]);
                }
            }

            group.add(this.trackPoints);
        }
    }

    addSingleTrack(negativeHeadFrom, headTo) {
         var headFrom = convertInt(negativeHeadFrom) + 180;
         if (headFrom >= 360) {
             headFrom -= 360;
         }

         for (var j = -1; j <= 1; j += 2) {
             var p1 = this.getLaneStartPoint(headFrom, config.Street.laneDrive + j*config.Track.width/2, config.Track.lanePointFactor);
             var p2 = this.getLaneTargetPoint(headTo, config.Street.laneDrive + j*config.Track.width/2, config.Track.lanePointFactor);

             if (headFrom === headTo) {
                 this.trackPoints.moveTo(p1.x, p1.y);
                 this.trackPoints.lineTo(p2.x, p2.y);
             } else {
                 var curve = this.getCurve(p1, p2, headFrom, headTo, config.Track.bezierFactor);
                 var path = curve.getPath(config.Track.curveFactor);

                 this.trackPoints.moveTo(p1.x, p1.y);
                 this.trackPoints.lineTo(path[0].x, path[0].y);
                 for (var i = 1; i < path.length; i++) {
                     this.trackPoints.lineTo(path[i].x, path[i].y);
                 }
                 this.trackPoints.lineTo(p2.x, p2.y);
             }
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

    hasTracks() {
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

    generateTrams(tramImages) {
        if (this.hasTracks() && this.isStraight()) {
            if (Math.random() < config.Track.probTram) {
                this.addCar(new Car(this, tramImages, config.Tram.numTypes, true));
            }
        }
    }

    generateTrack(track) {
        if (!this.isStreet()) {
            return;
        }

        this.newTrack = {};
        var indices = [];
        var index = track.indexOf(this.hash);
        while (index != -1) {
            indices.push(index);
            index = track.indexOf(this.hash, index + 1);
        }

        for (var i = 0; i < indices.length; i++) {
            if (track.length === 1) {
                this.newTrack[60] = [240];
                this.newTrack[120] = [300];
                this.newTrack[240] = [60];
                this.newTrack[300] = [120];
            } else {
                var indexNext = indices[i] + 1;
                var indexPrev = indices[i] - 1;
                if (indexNext === track.length) {
                    indexNext = 0;
                }
                if (indexPrev === -1) {
                    indexPrev = track.length - 1;
                }

                var negativeHeadFrom = null;
                var headTo = null;
                if (track[indexPrev] in this.neighbourConnections && track[indexNext] in this.neighbourConnections) {
                    negativeHeadFrom = this.neighbourConnections[track[indexPrev]];
                    headTo = this.neighbourConnections[track[indexNext]];
                } else if (track[indexPrev] in this.neighbourConnections) {
                    negativeHeadFrom = this.neighbourConnections[track[indexPrev]];
                    headTo = negativeHeadFrom + 180;
                    if (headTo >= 360) {
                        headTo -= 360;
                    }
                } else if (track[indexNext] in this.neighbourConnections) {
                    headTo = this.neighbourConnections[track[indexNext]];
                    negativeHeadFrom = headTo + 180;
                    if (negativeHeadFrom >= 360) {
                        negativeHeadFrom -= 360;
                    }
                }

                if (headTo !== null) {
                    if (negativeHeadFrom in this.newTrack) {
                        this.newTrack[negativeHeadFrom].push(headTo);
                    } else {
                        this.newTrack[negativeHeadFrom] = [headTo];
                    }
                }
            }
        }
    }

    finalizeTrack() {
        for (var head in this.newTrack) {
            if (head in this.track) {
                for (var i = 0; i < this.newTrack[head].length; i++) {
                    this.track[head].push(this.newTrack[head][i]);
                }
            } else {
                this.track[head] = this.newTrack[head];
            }
        }
        for (var headFrom in this.track) {
            var headsTo = [];
            for (var i = 0; i < this.track[headFrom].length; i++) {
                if (!headsTo.includes(this.track[headFrom][i])) {
                    headsTo.push(this.track[headFrom][i]);
                }
            }
            this.track[headFrom] = headsTo;
        }
        this.newTrack = {};
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

    isTrackNeighbourOf(tile) {
        return tile.hash in this.neighbourConnections;
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
            if (bindToTrack && this.hasTracks()) {
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
        this.cars.push(car);
        this.carHashes.push(car.hash);
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
