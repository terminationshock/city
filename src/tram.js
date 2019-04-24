class Tram extends Vehicle {
    start() {
        var intHead = this.getHead();
        var lane = this.tile.getLane(intHead, config.Street.laneDrive);
        this.startXY(intHead, lane);
        this.queue = [this.callbackDrive];
    }

    getNextTurn() {
        var head = this.driver.decideTurn(this.tile);
        if (head === null) {
            error('Tram does not find a way', this, this.disable);
            return null;
        }
        return head;
    }

    isOnStraight() {
        return this.tile.isStraightTrack();
    }

    isOnNonIntersectingWay() {
        return this.tile.isNonIntersectingTrack();
    }

    isParking() {
        return false;
    }

    callbackAtStop() {
        if (this.tile.equals(this.lastStop)) {
            this.queue.push(this.callbackDrive);
            return true;
        }

        this.v = 0;
        this.waitingTime = 0;

        if (this.driver.leaveStop()) {
            this.lastStop = this.tile;
            this.queue.push(this.callbackDrive);
            return true;
        }
        return false;
    }
};
