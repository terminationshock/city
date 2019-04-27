class Tile {
    constructor(fileId, x, y) {
        this.hash = generateRandomId();
        this.fileId = fileId;
        this.imgX = x;
        this.imgY = y;
        this.x = this.imgX + Math.floor(config.Tile.width / 2);
        this.y = this.imgY + Math.floor(config.Tile.height / 2);
        this.neighbours = [];
        this.streetNeighbours = [];
        this.neighbourConnections = {};
        this.lineSegments = [];
        this.tracks = new Tracks(this);
        this.tramstop = null;
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

        this.hover = new Phaser.Graphics(game, this.imgX, this.imgY);
        this.hover.beginFill(Phaser.Color.hexToRGB(config.Tile.hoverColor));
        this.hover.fillAlpha = 0.5;
        this.hover.drawPolygon(new Point(config.Tile.width / 2, 0),
                               new Point(config.Tile.width, config.Tile.height / 2),
                               new Point(config.Tile.width / 2, config.Tile.height),
                               new Point(0, config.Tile.height / 2));
        this.hover.endFill();
        this.hover.visible = false;
        rowGroupGround.add(this.hover);
    }

    drawTracks(group) {
        this.tracks.draw(group);
        if (this.hasTracks() && this.trees !== null) {
            this.trees.remove();
        }
    }

    drawVehicles(group) {
        this.vehicles.forEach(function(vehicle) {
            vehicle.draw(group);
        });
    }

    drawStop(group) {
        if (this.hasStop()) {
            this.tramstop.draw(group);
        }
    }

    setHover(hover) {
        this.hover.visible = hover;
    }

    addStop() {
        this.tramstop = new TramStop(this);
    }

    equals(other) {
        if (other === null) {
            return false;
        }
        return this.hash === other.hash;
    }

    update() {
        this.vehicles.forEach(function(vehicle) {
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

    isStraightTrack() {
        if (this.hasTracks()) {
            return this.tracks.isStraight();
        }
        return false;
    }

    getStraightTracks() {
        if (this.hasTracks()) {
            return this.tracks.getStraights();
        }
        return null;
    }

    isNonIntersectingTrack() {
        if (this.hasTracks()) {
            return this.tracks.isNotIntersecting();
        }
        return true;
    }

    isDeadEndOrJunctionOrCrossing() {
        if (this.isDeadEnd()) {
            return true;
        }
        if (!this.isStraightOrCurve() && !this.isGrass()) {
            return true;
        }
        if (this.hasTracks()) {
            if (this.tracks.isDeadEnd()) {
                return true;
            }

            var lines = this.lineSegments.concat(this.tracks.getLineSegments());
            if (this.linesIntersectInside(lines)) {
                return true;
            }
        }
        return false;
    }

    linesIntersectInside(lines) {
        var point = null;
        for (var i = 0; i < lines.length; i++) {
            for (var j = i+1; j < lines.length; j++) {
                if (!linesAreEqual(lines[i], lines[j])) {
                    for (var line1 of lines[i]) {
                        for (var line2 of lines[j]) {
                            point = Phaser.Line.intersects(line1, line2);
                            if (point !== null && this.inside(point.x, point.y, 0.99)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    hasStop() {
        return this.tramstop !== null;
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
                    this.addVehicle(new Car(this, head, carImages, config.Car.numTypes, null));
                }
            }
        }
    }

    generateTrack(track) {
        this.tracks.generate(track);
    }

    abortTrack() {
        this.tracks.abort();
    }

    finalizeTrack() {
        this.tracks.finalize();
        if (this.hasStop() && !this.isStraightTrack()) {
            this.tramstop.draw(null);
            this.tramstop = null;
        }
    }

    getTrackHeadsFrom(head) {
        return this.tracks.getHeadsFrom(head);
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

    computeLineSegments() {
        var connections = this.getStreetConnections();
        if (connections.length === 2) {
            for (var i = 0; i < 2; i++) {
                var headFrom = normalizeAngle(connections[i] + 180);
                var headTo = connections[1-i];
                var p1 = this.getLaneStartPoint(headFrom, config.Street.laneDrive, 1);
                var p2 = this.getLaneTargetPoint(headTo, config.Street.laneDrive, 0.24);
                var segments = [];
                if (getTurnDirection(headFrom, headTo) === -1) {
                    segments.push(new Phaser.Line(Math.round(p1.x), Math.round(p1.y), Math.round(this.x), Math.round(this.y)));
                    segments.push(new Phaser.Line(Math.round(this.x), Math.round(this.y), Math.round(p2.x), Math.round(p2.y)));
                } else {
                    segments.push(new Phaser.Line(Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y)));
                }
                this.lineSegments.push(segments);
            }
        }
    }

    getNeighbourConnection(tile) {
        var hash = tile;
        if (typeof tile !== 'string') {
            hash = tile.hash;
        }
        return this.neighbourConnections[hash];
    }

    getNeighbourAtHead(head) {
        var list = this.neighbours.filter(x => this.neighbourConnections[x.hash] === head);
        if (list.length !== 1) {
            return null;
        }
        return list[0];
    }

    isTrackNeighbourOf(tile) {
        return this.neighbours.includes(tile) && !tile.isHouse();
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

    centerAhead(x, head) {
        if (0 < head && head < 180) {
            return x < this.x;
        }
        return x > this.x;
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
        for (var head of [60, 120, 240, 300]) {
            switch (head) {
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

    getLaneStartPoint(head, lane, factor) {
        var dist = factor * config.Tile.width;
        var x = this.x - Math.sin(head * Math.PI/180) * dist;
        var y = this.y + Math.cos(head * Math.PI/180) * dist;
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

    onlySameVehicleType() {
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
        if (this.hasStop()) {
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
