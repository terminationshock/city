class CarAI {
    constructor() {
        this.waiting = 0;
    }

    leaveParkingLot() {
        return Math.random() < config.AI.probStepDrive;
    }

    leaveStop() {
        this.waiting += 1;
        if (this.waiting > config.AI.waitAtStop) {
            this.waiting = 0;
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
