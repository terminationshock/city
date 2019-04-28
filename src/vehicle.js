class Vehicle {
    constructor(tile, head, vehicleImages, numTypes) {
        this.hash = generateRandomId();
        this.colorId = vehicleImages[Math.floor(Math.random() * vehicleImages.length)];
        this.typeId = Math.floor(Math.random() * numTypes);
        this.sprite = null;
        this.bounds = {};
        this.tile = tile;
        this.oldTile = 'null';
        this.v = 0;
        this.head = head;
        this.queue = [];
        this.cachedHead = null;
        this.cachedClosestHead = null;
        this.cachedSpriteHead = null;
        this.cachedSpritePosition = new Point(null, null);
        this.start();
        this.waitingTime = 0;
        this.collisionWith = null;
        this.turnPath = null;
        this.plannedHead = null;
        this.error = false;
        this.lastStop = null;
    }

    disable() {
        this.y = -100;
        this.error = true;
        this.tile.removeVehicle(this);
        this.sprite.destroy();
        this.queue = [];
    }

    equals(other) {
        return this.hash === other.hash;
    }

    closeTo(other, x, y) {
        return (x - other.x)**2 + (y - other.y)**2 < 0.5 * (this.sprite.height + other.sprite.height)**2;
    }

    startXY(head, lane) {
        this.x = this.tile.x;
        if (head === 60 || head === 300) {
            this.x += config.Tile.width / 4;
        } else {
            this.x -= config.Tile.width / 4;
        }
        this.y = (lane.nx * (lane.px - this.x) + lane.ny * lane.py) / lane.ny;
    }

    draw(group) {
        if (this.sprite === null) {
            this.sprite = game.add.sprite(0, 0, this.colorId);
            this.updateSprite(this.x, this.y, this.getHead());
            group.add(this.sprite);
            this.createBounds();
            this.setCursor();
        }
    }

    createBounds() {
        var size = this.sprite.width;

        var canvas = document.getElementById('vehicle-canvas');
        var image = this.sprite.texture.baseTexture.source;
        canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

        var y0 = this.typeId * size;
        for (var headIndex = 0; headIndex < config.Vehicle.headingOrder.length; headIndex++) {
            var points = [];
            var x0 = headIndex * size;
            for (var angle = 0; angle < 360; angle += config.Vehicle.collisionSampling) {
                for (var i = 0; i < size; i++) {
                    var x = Math.round(i * Math.sin(angle * Math.PI / 180));
                    var y = -Math.round(i * Math.cos(angle * Math.PI / 180));
                    var alpha = canvas.getContext('2d').getImageData(x + x0 + Math.round(size / 2), y + y0 + Math.round(size / 2), 1, 1).data[3];
                    if (alpha < 255) {
                        points.push(x);
                        points.push(y);
                        break;
                    }
                }
            }
            this.bounds[config.Vehicle.headingOrder[headIndex]] = new Phaser.Polygon(points);
        }
    }

    getBounds() {
        return this.bounds[this.getHead()];
    }

    updateSprite(x, y, head) {
        if (this.sprite !== null) {
            this.updateSpritePosition(x, y);
            this.updateSpriteFrame(head);
        }
    }

    updateSpritePosition(x, y) {
        if (!this.cachedSpritePosition.equals(x, y)) {
            this.sprite.x = x - this.sprite.width / 2;
            this.sprite.y = y - this.sprite.height / 2;
            this.sprite.yz = y + this.sprite.height / 2;
            this.cachedSpritePosition = new Point(x, y);
        }
    }

    updateSpriteFrame(head) {
        head = convertInt(head);
        if (this.cachedSpriteHead !== head) {
            var col = config.Vehicle.headingOrder.indexOf(head);
            if (col === -1) {
                error('Heading not in vehicle sprite', this, this.disable);
                return null;
            }
            this.sprite.frame = this.typeId * config.Vehicle.headingOrder.length + col;
            this.cachedSpriteHead = head;
        }
    }

    click(x, y) {
        if (this.sprite !== null) {
           return Phaser.Rectangle.containsPoint(this.sprite.getBounds(), new Phaser.Point(x, y));
        }
        return false;
    }

    getLine() {
        return this.driver.getLine();
    }

    update() {
        if (this.error) {
            return;
        }

        if (this.queue[0].call(this)) {
            this.queue.shift();
        }

        var dt = 1.0 / config.World.stepsPerSecond;
        this.waitingTime += dt;

        if (this.v > 0) {
            var intHead = this.getHead();
            var dx = Math.sin(intHead * Math.PI / 180) * this.v * dt;
            var dy = -Math.cos(intHead * Math.PI / 180) * this.v * dt;

            if (this.collision(this.x + dx, this.y + dy, intHead)) {
                this.queue.splice(0, 0, this.callbackWait);
            } else {
                this.waitingTime = 0;
                this.x += dx;
                this.y += dy;

                this.enterNewTile();
                if (!this.tile.inside(this.x, this.y)) {
                    error('Vehicle has left its tile', this, this.disable);
                }

                this.updateSprite(this.x, this.y, intHead);
            }
        }

        if (this.waitingTime > config.Vehicle.waitForever && this.collisionWith !== null) {
            if (this.collisionWith.collidingWith(this)) {
                error('Vehicle is in a collision loop', this, this.disable);
            }
        }
    }

    enterNewTile() {
        if (this.tile.inside(this.x, this.y)) {
            return;
        }

        for (var tile of this.tile.neighbours) {
            if (tile.inside(this.x, this.y)) {
                if (this.getHead() === convertInt(this.tile.getNeighbourConnection(tile))) {
                    this.laneAssist();
                    if (this.tile.inside(this.x, this.y)) {
                        return;
                    }
                }

                if (this.isInFront(tile, this.x, this.y, this.head)) {
                    this.oldTile = this.tile.hash;
                    this.tile.removeVehicle(this);
                    this.tile = tile;
                    this.tile.addVehicle(this);
                    this.plannedHead = null;

                    this.parkNow();
                    return;
                }
            }
        }
    }

    getHead() {
        if (this.cachedHead !== this.head) {
            this.cachedHead = this.head;
            this.cachedClosestHead = this.getClosestHead(this.head, false);
        }
        return this.cachedClosestHead;
    }

    getNextHead(turn) {
        var index = config.Vehicle.headingOrder.indexOf(this.getHead()) + turn;
        if (index < 0) {
            index += config.Vehicle.headingOrder.length;
        } else if (index >= config.Vehicle.headingOrder.length) {
            index -= config.Vehicle.headingOrder.length;
        }
        return config.Vehicle.headingOrder[index];
    }

    getClosestHead(head, floor) {
        if (head < 0 || 360 <= head) {
            error('Heading out of range', this, this.disable);
            return null;
        }

        var headingOrderCopy = config.Vehicle.headingOrder.slice(0);
        if (floor) {
            headingOrderCopy.sort(function(a, b) {
                return a - b;
            });
            for (var i = 0; i < headingOrderCopy.length - 1; i++) {
                if (headingOrderCopy[i] <= head && head < headingOrderCopy[i + 1]) {
                    return headingOrderCopy[i];
                }
            }
            return headingOrderCopy.reverse()[0];
        } else {
            if (head > 300) {
                headingOrderCopy[config.Vehicle.headingOrder.indexOf(0)] = 360;
            }
            var closestHead = headingOrderCopy.reduce(function(a, b) {
                if (Math.abs(a - head) < Math.abs(b - head)) {
                    return a;
                }
                return b;
            });
            if (closestHead === 360) {
                return 0;
            }
            return closestHead;
        }
    }

    getTurnPath(targetHead) {
        var p1 = new Point(this.x, this.y);
        var p2 = this.tile.getLaneTargetPoint(targetHead, config.Street.laneDrive, config.Street.lanePointFactor);

        var curve = getCurve(p1, p2, this.getHead(), targetHead, config.Street.bezierFactor);
        return curve.getPath(config.Vehicle.velocityTurn / config.World.stepsPerSecond);
    }

    laneAssist() {
        var point = this.tile.getClosestPointInLane(this.x, this.y, this.getHead(), config.Street.laneDrive);
        this.x = point.x;
        this.y = point.y;
    }

    isInFront(other, x, y, head) {
        var dx = other.x - x;
        var dy = other.y - y;
        var direction = this.getHeadFromDxDy(dx, dy);
        if ((head + 60 < direction && direction < head + 300) || (head + 60 < direction + 360 && direction + 360 < head + 300)) {
            return false;
        }
        return true;
    }

    getHeadFromDxDy(dx, dy) {
        var head = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (head < 0) {
            head += 360;
        }
        return head;
    }

    getMaxDistancePerStep() {
        return Math.ceil(this.v / config.World.stepsPerSecond);
    }

    collidingWith(vehicle) {
        if (this.collisionWith === null) {
            return false;
        }
        return this.collisionWith.equals(vehicle);
    }

    collision(x, y, head) {
        var vehicle = null;
        for (vehicle of this.tile.vehicles) {
            if (this.collideWith(vehicle, x, y, head)) {
                this.collisionWith = vehicle;
                return true;
            }
        }
        for (var tile of this.tile.neighbours) {
            for (vehicle of tile.vehicles) {
                if (this.collideWith(vehicle, x, y, head)) {
                    this.collisionWith = vehicle;
                    return true;
                }
            }
        }
        this.collisionWith = null;
        return false;
    }

    collideWith(other, x, y, head) {
        if (this.equals(other)) {
            return false;
        }
        if (other.error) {
            return false;
        }
        if (!this.closeTo(other, x, y)) {
            return false;
        }
        if (other.isParking()) {
            return false;
        }
        if (!this.isInFront(other, x, y, head)) {
            return false;
        }
        for (var turn = 4; turn < 13; turn++) {
            if (other.getNextHead(turn) === head) {
                return false;
            }
        }

        var xoff = other.x - x;
        var yoff = other.y - y;
        var points = other.getBounds().points;
        for (var point of points) {
            if (this.bounds[head].contains(point.x + xoff, point.y + yoff)) {
                return true;
            }
        }
        return false;
    }

    parkNow() {
    }

    callbackProceedToTargetLane(targetHead, targetLane) {
        if (targetHead === null) {
            targetHead = this.plannedHead;
        }
        this.v = config.Vehicle.velocityTurn;

        var distanceToLane = this.tile.getDistanceToLane(this.x, this.y, targetHead, targetLane);
        if (distanceToLane < this.getMaxDistancePerStep()) {
            if (this.collision(this.x, this.y, targetHead)) {
                this.v = 0;
                return false;
            }

            this.head = targetHead;
            return true;
        }
        return false;
    }

    callbackDrive() {
        if (this.queue.length !== 1) {
            error('Callback queue corrupted', this, this.disable);
            return true;
        }

        if (this.tile.isHighway() || this.tile.isGrass()) {
            this.v = config.Vehicle.velocityHighway;
        } else {
            this.v = config.Vehicle.velocityCity;
        }

        if (this.tile.hasStop() && this.isOnStraight() && this.tile.inside(this.x, this.y, config.Vehicle.centerSizeFactor)) {
            this.queue.push(this.callbackAtStop);
            return true;
        }

        if (this.tile.isDeadEndOrJunctionOrCrossing()) {
            if (!(this.isOnNonIntersectingWay() && this.tile.onlySameVehicleType())) {
                var index = this.tile.getVehicleIndex(this);
                for (var i = 0; i < index; i++) {
                    if (!this.tile.vehicles[i].isParking() && this.tile.vehicles[i].waitingTime <= config.Vehicle.waitBlocked) {
                        this.v = 0;
                        this.waitingTime = 0;
                        return false;
                    }
                }
            }
        }

        if (this.plannedHead === null) {
            if (!this.isOnStraight() && this.tile.nearCenter(this.x, this.y)) {
                this.plannedHead = this.getNextTurn();
                if (this.plannedHead === null) {
                    return true;
                }
                if (this.plannedHead === this.getHead()) {
                    this.queue.push(this.callbackDrive);
                } else {
                    this.queue.push(this.callbackTurn);
                    this.queue.push(function() {
                        return this.callbackProceedToTargetLane(null, config.Street.laneDrive);
                    });
                    this.queue.push(this.callbackDrive);
                }
                return true;
            }
        }

        return false;
    }

    callbackWait() {
        return true;
    }

    callbackTurn() {
        this.v = 0.01;

        var distanceToLane = this.tile.getDistanceToLane(this.x, this.y, this.plannedHead, config.Street.laneDrive);
        if (distanceToLane < this.getMaxDistancePerStep()) {
            this.turnPath = null;
            return true;
        }

        if (this.turnPath === null) {
            this.turnPath = this.getTurnPath(this.plannedHead);
        }

        var head = this.turnPath[0].head;
        var x = this.turnPath[0].x;
        var y = this.turnPath[0].y;

        var closestHead = this.getClosestHead(head, true);
        if (this.collision(x, y, closestHead)) {
            this.v = 0;
            return false;
        }

        this.head = head;
        this.x = x;
        this.y = y;
        this.turnPath.splice(0, 1);

        if (this.turnPath.length === 0) {
            this.turnPath = null;
            return true;
        }
        return false;
    }
};
