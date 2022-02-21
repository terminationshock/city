/* This file is part of City.

 * City is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * City is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with City.  If not, see <http://www.gnu.org/licenses/>.
*/

class Car extends Vehicle {
    constructor(...args) {
        super(...args);
        this.driver = new CarDriver();
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
};
