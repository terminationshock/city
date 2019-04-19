class Tram extends Vehicle {
    start() {
        var intHead = this.getHead();
        var lane = this.tile.getLane(intHead, config.Street.laneDrive);
        this.startXY(intHead, lane);
        this.queue = [this.callbackDrive];
    }

    getNextTurn() {
        var head = this.tile.neighbourConnections[this.oldTile];
        var heads = this.tile.getTrackHeadsFrom(head);
        if (heads === null) {
            error('Tram does not find a way', this, this.disable);
            return null;
        }
        return this.driver.decideTurn(heads);
    }

    isOnStraight() {
        return this.tile.isStraightTrack();
    }

    isOnCurve() {
        return this.tile.isCurveTrack();
    }

    isParking() {
        return false;
    }

    callbackAtStop() {
        this.v = 0;
        this.waitingTime = 0;

        if (this.driver.leaveStop()) {
            this.queue.push(this.callbackDrive);
            return true;
        }
        return false;
    }
}
