class Car extends Vehicle {
    constructor(...args) {
        super(...args);
        this.driver = new CarDriver();
    }

    isTram() {
        return false;
    }

    setCursor() {
    }

    start() {
        var intHead = this.getHead();
        var lane = this.tile.getLane(intHead, config.Street.lanePark);
        this.startXY(intHead, lane);
        this.queue = [this.callbackPark];
    }

    getNextTurn() {
        var conn = this.tile.getStreetConnections().slice(0);

        if (!this.tile.isDeadEnd()) {
            var neighbourHashes = this.tile.streetNeighbours.map(tile => tile.hash);
            if (neighbourHashes.includes(this.oldTile)) {
                var head = this.tile.neighbourConnections[this.oldTile];
                if (conn.includes(head)) {
                    conn.splice(conn.indexOf(head), 1);
                }
            }
        }

        if (conn.length === 0) {
            error('Empty connection list', this, this.disable);
            return null;
        }

        var carIndex = this.tile.getVehicleIndex(this);
        for (var i = 0; i < carIndex; i++) {
            var car = this.tile.vehicles[i];
            if (car.waitingTime > config.Vehicle.waitBlocked && conn.length > 1) {
                if (conn.includes(car.getHead())) {
                    conn.splice(conn.indexOf(car.getHead()), 1);
                } else if (conn.includes(car.plannedHead)) {
                    conn.splice(conn.indexOf(car.plannedHead), 1);
                }
            }
        }

        return this.driver.decideTurn(conn);
    }

    parkNow() {
        if (this.queue[0] === this.callbackDrive && this.driver.parkNow() && this.tile.hasFreeParkingLot(this.getHead())) {
            this.queue = [this.callbackEnterParkingLot];
        }
    }

    isOnStraight() {
        return this.tile.isStraight();
    }

    isOnNonIntersectingWay() {
        return this.tile.isStraight() || this.tile.isCurve();
    }

    isParking() {
        return convertInt(this.v) === 0 && [this.callbackPark, this.callbackLeaveParkingLot].includes(this.queue[0]);
    }

    callbackEnterParkingLot() {
        this.queue.push(function() {
            return this.callbackChangeLane(1);
        });
        this.queue.push(function() {
            var head = this.getNextHead(-2);
            return this.callbackProceedToTargetLane(head, config.Street.lanePark);
        });
        this.queue.push(this.callbackPark);
        return true;
    }

    callbackPark() {
        this.v = 0;
        this.waitingTime = 0;

        if (this.driver.leaveParkingLot()) {
            this.queue.push(this.callbackLeaveParkingLot);
            return true;
        }
        return false;
    }

    callbackLeaveParkingLot() {
        if (!this.tile.onlySameVehicleType()) {
            return false;
        }

        for (var vehicle of this.tile.vehicles) {
            if (!this.equals(vehicle) && !vehicle.isParking() && vehicle.getHead() === this.getHead()) {
                return false;
            }
        }

        this.queue.push(function() {
            return this.callbackChangeLane(-1);
        });
        this.queue.push(function() {
            var head = this.getNextHead(2);
            return this.callbackProceedToTargetLane(head, config.Street.laneDrive);
        });
        this.queue.push(this.callbackDrive);
        return true;
    }

    callbackChangeLane(turn) {
        this.head = this.getNextHead(2 * turn);
        return true;
    }

    callbackAtStop() {
        this.queue.push(this.callbackDrive);
        return true;
    }
};
