class Car {
    constructor(tile, carImages) {
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

    startInParkingLot(tile) {
        this.v = 0;
        this.tile = tile;
        this.oldTile = null;
        this.head = this.tile.getRandomConnection();
        this.fhead = this.head;

        var lane = this.tile.getLane(this.head, config.Street.lanePark);
        this.x = this.tile.x;
        if (this.head == 60 || this.head == 300) {
            this.x += config.Tile.width / 4;
        } else {
            this.x -= config.Tile.width / 4;
        }
        this.y = (lane.nx * (lane.px-this.x) + lane.ny * lane.py) / lane.ny;
    }

    getFrameIndex() {
        var col = config.Car.headingOrder.indexOf(this.head);
        if (col == -1) {
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

        if (this.v == 0) {
            if (this.isParking()) {
                this.waiting = 0;
            }
        } else {
            var dx = Math.sin(this.head * Math.PI/180) * this.v * dt;
            var dy = -Math.cos(this.head * Math.PI/180) * this.v * dt;

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
                var head = this.tile.neighbourConnections[tile];
                if (this.head == head) {
                    this.laneAssist();
                    if (this.tile.inside(this.x, this.y)) {
                        return;
                    }
                }

                if (this.isInFront(tile, this.x, this.y, this.head)) {
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
        return this.v == 0 && [this.callbackPark, this.callbackLeaveParkingLot].indexOf(this.queue[0]) >= 0;
    }

    getHead() {
        return this.head;
    }

    getNextHead(turn) {
        var index = config.Car.headingOrder.indexOf(this.head) + turn;
        if (index < 0) {
            index += config.Car.headingOrder.length;
        } else if (index >= config.Car.headingOrder.length) {
            index -= config.Car.headingOrder.length;
        }
        return config.Car.headingOrder[index];
    }

    laneAssist() {
        var lane = this.tile.getLane(this.head, config.Street.laneDrive);

        var fx = lane.nx**2 * lane.px + lane.ny**2 * this.x + lane.nx * lane.ny * (lane.py - this.y);
        var fy = lane.ny**2 * lane.py + lane.nx**2 * this.y + lane.nx * lane.ny * (lane.px - this.x);
        this.x = fx;
        this.y = fy;
    }

    isInFront(other, x, y, head) {
        var dx = other.x - x;
        var dy = other.y - y;
        var direction = this.getHeadFromDxDy(dx, dy);
        if ([direction, direction+360].indexOf(head) >= 0) {
            if (head + 60 < angle && angle < head + 300) {
                return false;
            }
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
            if (this.tile.cars[i] !== this && !this.tile.cars[i].isParking() && this.tile.cars[i].getHead() == this.head) {
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
            var index = this.tile.cars.indexOf(this);
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
