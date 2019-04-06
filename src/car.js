class Car {
    constructor(tile, carImages, numTypes) {
        this.hash = generateRandomId();
        this.driver = new CarAI();
        this.colorId = carImages[Math.floor(Math.random() * carImages.length)];
        this.typeId = Math.floor(Math.random() * numTypes);
        this.sprite = null;
        this.tile = tile;
        this.oldTile = 'null';
        this.v = 0;
        this.head = 0;
        this.cachedHead = null;
        this.cachedClosestHead = null;
        this.cachedSpriteHead = null;
        this.cachedSpriteFrameIndex = null;
        this.startInParkingLot();
        this.queue = [this.callbackPark];
        this.waiting = 0;
        this.turnPath = null;
        this.plannedHead = null;
        this.error = false;
    }

    disable() {
        this.y = -100;
        this.error = true;
        this.sprite.destroy();
    }

    equals(other) {
        return this.hash === other.hash;
    }

    closeTo(other) {
        return (this.x-other.x)**2 + (this.y-other.y)**2 < (1.5*this.sprite.height)**2;
    }

    startInParkingLot() {
        this.head = this.tile.getRandomConnection();
        var intHead = this.getHead();
        var lane = this.tile.getLane(intHead, config.Street.lanePark);
        this.x = this.tile.x;
        if (intHead === 60 || intHead === 300) {
            this.x += config.Tile.width / 4;
        } else {
            this.x -= config.Tile.width / 4;
        }
        this.y = (lane.nx * (lane.px-this.x) + lane.ny * lane.py) / lane.ny;
    }

    getFrameIndex(head) {
        head = convertInt(head);
        if (this.cachedSpriteHead !== head) {
            var col = config.Car.headingOrder.indexOf(head);
            if (col === -1) {
                error('Heading not in car sprite', this, this.disable);
            }
            this.cachedSpriteHead = head;
            this.cachedSpriteFrameIndex = this.typeId * config.Car.headingOrder.length + col;
        }
        return this.cachedSpriteFrameIndex;
    }

    draw(group) {
        this.sprite = game.add.sprite(0, 0, this.colorId);
        this.updateSprite(this.x, this.y, this.getHead());
        group.add(this.sprite);
    }

    updateSprite(x, y, head) {
        if (this.sprite !== null) {
            this.sprite.x = x - this.sprite.width/2;
            this.sprite.y = y - this.sprite.height/2;
            this.sprite.yz = y;
            this.sprite.frame = this.getFrameIndex(head);
        }
    }

    update() {
        if (this.error) {
            return;
        }

        if (this.queue[0].call(this)) {
            this.queue.shift();
        }

        var dt = 1.0 / config.World.stepsPerSecond;
        this.waiting += dt;

        if (convertInt(this.v) === 0) {
            if (this.isParking()) {
                this.waiting = 0;
            }
        } else {
            var intHead = this.getHead();
            var dx = Math.sin(intHead * Math.PI/180) * this.v * dt;
            var dy = -Math.cos(intHead * Math.PI/180) * this.v * dt;

            this.updateSprite(this.x+dx, this.y+dy, intHead);

            if (this.collision()) {
                this.queue.splice(0, 0, this.callbackWait);
            } else {
                this.waiting = 0;
                this.x += dx;
                this.y += dy;

                this.enterNewTile();
                if (!this.tile.inside(this.x, this.y)) {
                    error('Car has left its tile', this, this.disable);
                }
            }

            this.updateSprite(this.x, this.y, intHead);
        }

        if (this.waiting > config.Car.waitForever) {
            error('Car is waiting forever', this, this.disable);
        }
    }

    enterNewTile() {
        if (this.tile.inside(this.x, this.y)) {
            return;
        }

        for (var i = 0; i < this.tile.streetNeighbours.length; i++) {
            var tile = this.tile.streetNeighbours[i];
            if (tile.inside(this.x, this.y)) {
                var head = this.tile.getNeighbourConnection(tile);
                if (this.getHead() === convertInt(head)) {
                    this.laneAssist();
                    if (this.tile.inside(this.x, this.y)) {
                        return;
                    }
                }

                if (this.isInFront(tile, this.x, this.y, this.getHead())) {
                    this.oldTile = this.tile.hash;
                    this.tile.removeCar(this);
                    this.tile = tile;
                    this.tile.addCar(this);
                    this.plannedHead = null;

                    this.parkNow();
                    return;
                }
            }
        }
    }

    isParking() {
        return convertInt(this.v) === 0 && [this.callbackPark, this.callbackLeaveParkingLot].includes(this.queue[0]);
    }

    getHead() {
        if (this.cachedHead !== this.head) {
            this.cachedHead = this.head;
            this.cachedClosestHead = this.getClosestHead(this.head, false);
        }
        return this.cachedClosestHead;
    }

    getNextHead(turn) {
        var index = config.Car.headingOrder.indexOf(this.getHead()) + turn;
        if (index < 0) {
            index += config.Car.headingOrder.length;
        } else if (index >= config.Car.headingOrder.length) {
            index -= config.Car.headingOrder.length;
        }
        return config.Car.headingOrder[index];
    }

    getClosestHead(head, floor) {
        if (head < 0 || 360 <= head) {
            error('Heading out of range', this, this.disable);
        }

        var headingOrderCopy = config.Car.headingOrder.slice(0);
        if (floor) {
            headingOrderCopy.sort(function (a, b) {
                return a-b;
            });
            for (var i = 0; i < headingOrderCopy.length-1; i++) {
                if (headingOrderCopy[i] <= head && head < headingOrderCopy[i+1]) {
                    return headingOrderCopy[i];
                }
            }
            return headingOrderCopy.reverse()[0];
        } else {
            if (head > 300) {
                headingOrderCopy[config.Car.headingOrder.indexOf(0)] = 360;
            }
            var closestHead = headingOrderCopy.reduce(function (a, b) {
                if (Math.abs(a-head) < Math.abs(b-head)) {
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
        var p2 = this.tile.getLaneTargetPoint(targetHead, config.Street.laneDrive, 0.2);
        var dt = 1.0 / config.World.stepsPerSecond;

        var curve = this.tile.getCurve(p1, p2, this.getHead(), targetHead, config.Car.bezierFactor);
        return curve.getPath(config.Car.velocityTurn * dt);
    }

    getNextTurn() {
        var conn = this.tile.connections.slice(0);

        if (!this.tile.isDeadEnd()) {
            var neighbourHashes = this.tile.streetNeighbours.map(tile => tile.hash);
            if (neighbourHashes.includes(this.oldTile)) {
                var head = this.tile.neighbourConnections[this.oldTile];
                if (conn.includes(head)) {
                    var index = conn.indexOf(head);
                    conn.splice(index, 1);
                }
            }
        }

        if (conn.length === 0) {
            error('Empty connection list', this, this.disable);
        }

        var carIndex = this.tile.getCarIndex(this);
        for (var i = 0; i < carIndex; i++) {
            var car = this.tile.cars[i];
            if (car.waiting > config.Car.waitBlocked && conn.length > 1) {
                if (conn.includes(car.getHead())) {
                    var index = conn.indexOf(car.getHead());
                    conn.splice(index, 1);
                } else if (conn.includes(car.plannedHead)) {
                    var index = conn.indexOf(car.plannedHead);
                    conn.splice(index, 1);
                }
            }
        }

        return this.driver.decideTurn(conn);
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
        if ((head + 60 < direction && direction < head + 300) || (head + 60 < direction+360 && direction+360 < head + 300)) {
            return false;
        }
        return true;
    }

    getHeadFromDxDy(dx, dy) {
        var head = Math.atan2(dx, -dy) * 180/Math.PI;
        if (head < 0) {
            head += 360;
        }
        return head;
    }

    getMaxDistancePerStep() {
        var dt = 1.0 / config.World.stepsPerSecond;
        return Math.ceil(this.v * dt);
    }

    collision() {
        for (var j = 0; j < this.tile.cars.length; j++) {
            if (this.collideWith(this.tile.cars[j])) {
                return true;
            }
        }
        for (var i = 0; i < this.tile.neighbours.length; i++) {
            for (var j = 0; j < this.tile.neighbours[i].cars.length; j++) {
                if (this.collideWith(this.tile.neighbours[i].cars[j])) {
                    return true;
                }
            }
        }
        return false;
    }

    collideWith(other) {
        if (this.equals(other)) {
            return false;
        }
        if (other.error) {
            return false;
        }
        if (!this.closeTo(other)) {
            return false;
        }
        if (other.isParking()) {
            return false;
        }
        var head = this.getHead();
        if (!this.isInFront(other, this.x, this.y, head)) {
            return false;
        }
        for (var turn = 4; turn < 13; turn++) {
            if (other.getNextHead(turn) === head) {
                return false;
            }
        }
        return Phaser.Rectangle.intersects(this.sprite.getBounds().scale(config.Car.collisionScale), other.sprite.getBounds().scale(config.Car.collisionScale));
    }

    parkNow() {
        if (this.queue[0] === this.callbackDrive && this.driver.parkNow() && this.tile.hasFreeParkingLot(this.getHead())) {
            this.queue = [this.callbackEnterParkingLot];
        }
    }

    callbackPark() {
        this.v = 0;

        if (this.driver.leaveParkingLot()) {
            this.queue.push(this.callbackLeaveParkingLot);
            return true;
        }
        return false;
    }

    callbackLeaveParkingLot() {
        for (var i = 0; i < this.tile.cars.length; i++) {
            if (!this.equals(this.tile.cars[i]) && !this.tile.cars[i].isParking() && this.tile.cars[i].getHead() === this.getHead()) {
                return false;
            }
        }

        this.queue.push(function () {
            return this.callbackChangeLane(-1);
        });
        this.queue.push(function () {
            var head = this.getNextHead(2);
            return this.callbackProceedToTargetLane(head, config.Street.laneDrive);
        });
        this.queue.push(this.callbackDrive);
        return true;
    }

    callbackEnterParkingLot() {
        this.queue.push(function () {
            return this.callbackChangeLane(1);
        });
        this.queue.push(function () {
            var head = this.getNextHead(-2);
            return this.callbackProceedToTargetLane(head, config.Street.lanePark);
        });
        this.queue.push(this.callbackPark);
        return true;
    }

    callbackChangeLane(turn) {
        this.head = this.getNextHead(2*turn);
        return true;
    }

    callbackProceedToTargetLane(targetHead, targetLane) {
        if (targetHead === null) {
            targetHead = this.plannedHead;
        }
        this.v = config.Car.velocityTurn;

        var distanceToLane = this.tile.getDistanceToLane(this.x, this.y, targetHead, targetLane);
        if (distanceToLane < this.getMaxDistancePerStep()) {
            this.updateSprite(this.x, this.y, targetHead);
            if (this.collision()) {
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
        }

        if (this.tile.isHighway()) {
            this.v = config.Car.velocityHighway;
        } else {
            this.v = config.Car.velocityCity;
        }

        if (!this.tile.isStraightOrCurve()) {
            var index = this.tile.getCarIndex(this);
            for (var i = 0; i < index; i++) {
                if (this.tile.cars[i].waiting <= config.Car.waitBlocked) {
                    this.v = 0;
                    return false;
                }
            }
        }

        if (this.plannedHead === null) {
            if (!this.tile.isStraight() && this.tile.nearCenter(this.x, this.y)) {
                this.plannedHead = this.getNextTurn();
                if (this.plannedHead === this.getHead()) {
                    this.queue.push(this.callbackDrive);
                } else {
                    this.queue.push(this.callbackTurn);
                    this.queue.push(function () {
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
        this.v = -1;

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
        this.updateSprite(x, y, closestHead);
        if (this.collision()) {
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
}
