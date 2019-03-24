class Car {
    constructor(tile, carImages) {
        this.hash = generateRandomId();
        this.driver = new CarAI();
        this.colorId = carImages[Math.floor(Math.random() * carImages.length)];
        this.typeId = Math.floor(Math.random() * config.Car.numTypes);
        this.sprite = null;
        this.group = null;
        this.startInParkingLot(tile);
        this.queue = [this.callbackPark];
        this.waiting = 0;
        this.turnPath = null;
    }

    disable() {
        this.group.destroy();
    }

    equals(other) {
        return this.hash === other.hash;
    }

    startInParkingLot(tile) {
        this.v = 0;
        this.tile = tile;
        this.oldTile = null;
        this.head = this.tile.getRandomConnection();
        this.fhead = this.head;

        var lane = this.tile.getLane(this.getHead(), config.Street.lanePark);
        this.x = this.tile.x;
        if (this.getHead() === 60 || this.getHead() === 300) {
            this.x += config.Tile.width / 4;
        } else {
            this.x -= config.Tile.width / 4;
        }
        this.y = (lane.nx * (lane.px-this.x) + lane.ny * lane.py) / lane.ny;
    }

    getFrameIndex() {
        var col = config.Car.headingOrder.indexOf(this.getHead());
        if (col === -1) {
            error('Heading not in car sprite', this, this.disable);
        }
        return this.typeId * config.Car.headingOrder.length + col;
    }

    draw() {
        var x = this.x - config.Car.imgSize/2;
        var y = this.y - config.Car.imgSize/2;
        this.sprite = game.add.sprite(x, y, this.colorId);
        this.sprite.frame = this.getFrameIndex();

        this.group = game.add.group();
        this.group.add(this.sprite);

        while (this.group.z > this.tile.group.z + 1) {
            game.world.moveDown(this.group);
        }
    }

    update() {
        if (this.group.game === null) {
            return;
        }

        if (this.queue[0].call(this)) {
            this.queue.shift();
        }

        var dt = 1. / config.World.stepsPerSecond;
        this.waiting += dt;

        if (convertInt(this.v) === 0) {
            if (this.isParking()) {
                this.waiting = 0;
            }
        } else {
            var dx = Math.sin(this.getHead() * Math.PI/180) * this.v * dt;
            var dy = -Math.cos(this.getHead() * Math.PI/180) * this.v * dt;

            var xTry = this.x + config.Car.collisionSpacing * dx;
            var yTry = this.y + config.Car.collisionSpacing * dy;

            if (this.collision(xTry, yTry, this.head)) {
                this.queue.splice(0, 0, this.callbackWait);
            } else {
                this.waiting = 0;
                this.x += dx;
                this.y += dy;

                this.enterNewTile();
                if (!this.tile.inside(this.x, this.y)) {
                    error('Car has left its tile', this, this.disable);
                }

                this.sprite.x = this.x - config.Car.imgSize/2;
                this.sprite.y = this.y - config.Car.imgSize/2;

                if (this.group.z > this.tile.group.z + 1) {
                    game.world.moveDown(this.group);
                } else if (this.group.z < this.tile.group.z + 1) {
                    game.world.moveUp(this.group);
                }

                if (this.group.z > this.tile.group.z + 1) {
                    game.world.moveDown(this.group);
                }
            }
        }
        this.sprite.frame = this.getFrameIndex();
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
                    //this.oldTile = this.tile;                 
                    this.tile.removeCar(this);
                    this.tile = tile;
                    this.tile.addCar(this);

                    //parkNow                       
                    return;
                }
            }
        }
    }

    isParking() {
        return convertInt(this.v) === 0 && [this.callbackPark, this.callbackLeaveParkingLot].includes(this.queue[0]);
    }

    getHead() {
        return convertInt(this.head);
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
        error('Invalid turn', this, this.disable);
    }

    getTurnPath(targetHead) {
        var turn = this.getTurnDirection(this.head, targetHead);

        var p1 = new Point(this.x, this.y);
        var dx1 = Math.sin(this.head * Math.PI/180);
        var dy1 = -Math.cos(this.head * Math.PI/180);

        var p2 = this.tile.getLaneTargetPoint(targetHead, config.Street.laneDrive);
        var dx2 = Math.sin(targetHead * Math.PI/180);
        var dy2 = -Math.cos(targetHead * Math.PI/180);

        var deltaHead = 0;
        if (turn < 0) {
            if (targetHead > this.head) {
                deltaHead = this.head - (targetHead - 360);
            } else {
                deltaHead = this.head - targetHead;
            }
        } else if (turn > 0) {
            if (targetHead < this.head) {
                deltaHead = (targetHead + 360) - this.head;
            } else {
                deltaHead = targetHead - this.head;
            }
        }

        var bezierFactor = config.Car.bezierFactor * deltaHead;
        var curve = new BezierCurve([p1,
                                     new Point(p1.x + bezierFactor*dx1, p1.y + bezierFactor*dy1),
                                     new Point(p2.x - bezierFactor*dx2, p2.y - bezierFactor*dy2),
                                     p2]);
        var dt = 1. / config.World.stepsPerSecond;
        return curve.getPath(config.Car.velocityTurn * dt);
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
        var dt = 1. / config.World.stepsPerSecond;
        return Math.ceil(this.v * dt);
    }

    collision(x, y, head) {
        return false;           
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

    callbackChangeLane(turn) {
        this.head = this.getNextHead(2*turn);
        return true;
    }

    callbackProceedToTargetLane(targetHead, targetLane) {
        this.v = config.Car.velocityTurn;

        var distanceToLane = this.tile.getDistanceToLane(this.x, this.y, targetHead, targetLane);
        if (distanceToLane < this.getMaxDistancePerStep()) {
            //if (collision)            
            this.head = targetHead;
            this.fhead = this.head;
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

        return false;
    }

    callbackWait() {
        return true;
    }

    callbackTurn(targetHead) {
        this.v = 0.001;

        var distanceToLane = this.tile.getDistanceToLane(this.x, this.y, targetHead, config.Street.laneDrive);
        if (distanceToLane < this.getMaxDistancePerStep()) {
            this.turnPath = null;
            return true;
        }

        if (this.turnPath === null) {
            this.turnPath = this.getTurnPath(targetHead);
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
}
