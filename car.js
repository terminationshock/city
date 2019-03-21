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

            if (false) {
                //callqueueinsert       
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

        var dt = 1. / config.World.stepsPerSecond;
        var maxDistancePerStep = Math.ceil(this.v * dt);
        var distanceToLane = this.tile.distanceToLane(this.x, this.y, targetHead, targetLane);
        if (distanceToLane < maxDistancePerStep) {
            //if (collision)
            this.head = targetHead;
            this.fhead = this.head;
            return true;
        }
        return false;
    }

    callbackDrive() {
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
}
