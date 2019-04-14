class Driver {
    constructor() {
        this.waitingTime = 0;
    }

    leaveParkingLot() {
        return Math.random() < config.AI.probStepDrive;
    }

    leaveStop() {
        this.waitingTime += 1;
        if (this.waitingTime > config.AI.waitAtStop) {
            this.waitingTime = 0;
            return true;
        }
        return false;
    }

    decideTurn(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    parkNow() {
        return Math.random() < config.AI.probTilePark;
    }
}
