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
        this.tracks = new Tracks(this);
        this.stop = false;
        this.hover = null;
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

    drawTracks(group) {
        this.tracks.draw(group);
        if (this.hasTracks() && this.trees !== null) {
            this.trees.remove();
        }
    }

    drawVehicles(group) {
        this.vehicles.forEach(function (vehicle) {
            vehicle.draw(group);
        });
    }

    addStop() {
        this.stop = true;
    }

    equals(other) {
        return this.hash === other.hash;
    }

    update() {
        this.vehicles.forEach(function (vehicle) {
            vehicle.update();
        });
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

    isStraightTrack() {
        if (this.hasTracks()) {
            return this.tracks.isStraight();
        }
        return false;
    }

    isCurveTrack() {
        if (this.hasTracks()) {
            return this.tracks.isCurve();
        }
        return false;
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

    isDeadEndOrJunctionOrCrossing() {
        if (this.isDeadEnd()) {
            return true;
        }
        if (!this.isStraightOrCurve() && !this.isGrass()) {
            return true;
        }
        if (this.hasTracks()) {
            var keys = this.tracks.getKeys().map(x => convertInt(x));
            if (keys.length > 2) {
                return true;
            }
            var connections = this.getStreetConnections();
            for (var head of keys) {
                if (this.getTrackHeadsFrom(head).length > 1) {
                    return true;
                }
                if (this.getTrackHeadsFrom(head)[0] === head) {
                    return true;
                }
                if (connections.length > 0) {
                    if (!connections.includes(head)) {
                        return true;
                    }
                    if (!connections.includes(this.getTrackHeadsFrom(head)[0])) {
                        return true;
                    }
                } else {
                    if (keys.length === 2 && !keys.includes(this.getTrackHeadsFrom(head)[0])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isDeadEnd() {
        return config.Street.deadEnds.includes(this.fileId);
    }

    hasStop() {
        return this.stop;
    }

    hasTracks() {
        return this.tracks.hasTracks();
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
                    this.addVehicle(new Car(this, head, carImages, config.Car.numTypes));
                }
            }
        }
    }

    generateTrams(tramImages) {
        if (this.hasTracks()) {
            var head = this.tracks.getRandomConnection();

            if (this.tracks.isStraight()) {
                if (Math.random() < config.Track.probTram) {
                    this.addVehicle(new Tram(this, head, tramImages, config.Tram.numTypes));
                }
            }
        }
    }

    generateTrack(track) {
        this.tracks.generate(track);
    }

    finalizeTrack() {
        this.tracks.finalize();
    }

    getTrackHeadsFrom(head) {
        return this.tracks.getHeadsFrom(head);
    }

    computeAllNeighbours(tiles) {
        var buf = 10;
        for (var tile of tiles) {
            if (!this.equals(tile)) {
                if (this.x + buf < tile.x && tile.x < this.x + config.Tile.width - buf
                    && this.y - config.Tile.height + buf < tile.y && tile.y < this.y - buf) {
                    this.neighbours.push(tile);
                } else if (this.x + buf < tile.x && tile.x < this.x + config.Tile.width - buf
                    && this.y + buf < tile.y && tile.y < this.y + config.Tile.height - buf) {
                    this.neighbours.push(tile);
                } else if (this.x - config.Tile.width + buf < tile.x && tile.x < this.x - buf
                    && this.y + buf < tile.y && tile.y < this.y + config.Tile.height - buf) {
                    this.neighbours.push(tile);
                } else if (this.x - config.Tile.width + buf < tile.x && tile.x < this.x - buf
                    && this.y - config.Tile.height + buf < tile.y && tile.y < this.y - buf) {
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
        return this.neighbourConnections[tile.hash];
    }

    isTrackNeighbourOf(tile) {
        return this.neighbours.includes(tile) && !tile.isHouse();
    }

    isConnectedTo(head) {
        var id = parseInt(this.fileId.substring(1,5));
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

    getCurve(p1, p2, head1, head2, bezierFactor) {
        var dx1 = Math.sin(head1 * Math.PI/180);
        var dy1 = -Math.cos(head1 * Math.PI/180);

        var dx2 = Math.sin(head2 * Math.PI/180);
        var dy2 = -Math.cos(head2 * Math.PI/180);

        var deltaHead = this.getDeltaHead(head1, head2);

        var bezierFactor = bezierFactor * deltaHead;
        if (deltaHead === 0) {
            return new BezierCurve([p1, p2]);
        }
        return new BezierCurve([p1,
                                new Point(p1.x + bezierFactor*dx1, p1.y + bezierFactor*dy1),
                                new Point(p2.x - bezierFactor*dx2, p2.y - bezierFactor*dy2),
                                p2]);
    }

    getDeltaHead(fromHead, toHead) {
        var turn = this.getTurnDirection(fromHead, toHead);

        var deltaHead = 0;
        if (turn < 0) {
            if (toHead > fromHead) {
                deltaHead = fromHead - (toHead - 360);
            } else {
                deltaHead = fromHead - toHead;
            }
        } else if (turn > 0) {
            if (toHead < fromHead) {
                deltaHead = (toHead + 360) - fromHead;
            } else {
                deltaHead = toHead - fromHead;
            }
        }
        return deltaHead;
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

    onlySameVehicleType(vehicle) {
        if (this.vehicles.length > 0) {
            var clazz = getClassOf(this.vehicles[0]);
            for (var i = 1; i < this.vehicles.length; i++) {
                if (getClassOf(this.vehicles[i]) !== clazz) {
                    return false;
                }
            }
        }
        return true;
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
}
