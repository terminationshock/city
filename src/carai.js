class CarAI {
    leaveParkingLot() {
        return true;
        //return Math.random() < config.AI.proStepDrive);
    }

    decideTurn(options) {
        return options[Math.floor(Math.random() * options.length)];
    }
}
