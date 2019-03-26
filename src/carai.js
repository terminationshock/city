class CarAI {
    leaveParkingLot() {
        return Math.random() < config.AI.probStepDrive;
    }

    decideTurn(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    parkNow() {
        return Math.random() < config.AI.probTilePark;
    }
}
