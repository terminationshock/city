class CarDriver extends Driver {
    leaveParkingLot() {
        return Math.random() < config.Driver.probStepDrive;
    }

    parkNow() {
        return Math.random() < config.Driver.probTilePark;
    }

    decideTurn(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    getLine() {
        return null;
    }
};
