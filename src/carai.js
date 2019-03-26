class CarAI {
    leaveParkingLot() {
        return Math.random() < config.AI.proStepDrive;
    }

    decideTurn(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    parkNow() {
        return Math.random() < config.AI.probTilePark;
    }
}
