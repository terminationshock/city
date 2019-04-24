class Driver {
    constructor(line) {
        this.waitingTime = 0;
        this.line = line;
    }

    leaveParkingLot() {
        return Math.random() < config.Driver.probStepDrive;
    }

    leaveStop() {
        this.waitingTime += 1;
        if (this.waitingTime > config.Driver.waitAtStop) {
            this.waitingTime = 0;
            return true;
        }
        return false;
    }

    decideTurn(options) {
        if (this.line !== null) {
            var i = this.line.indexOf(options.hash);
            if (i < 0) {
                return null;
            }
            i += 1;
            if (i > this.line.length - 1) {
                i = 0;
            }
            return options.getNeighbourConnection(this.line[i]);
        }
        return options[Math.floor(Math.random() * options.length)];
    }

    parkNow() {
        return Math.random() < config.Driver.probTilePark;
    }
};
