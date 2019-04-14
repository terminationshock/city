class DriverMock {
    leaveParkingLot() {
        return true;
    }

    decideTurn(conn) {
        return conn;
    }

    parkNow() {
        return true;
    }

    leaveStop() {
        return true;
    }
}

class SpriteMock {
    constructor() {
        this.height = 32;
    }
    getBounds() {
        return new Phaser.Rectangle(0, 0, 32, 32);
    }
}

class VehicleTest {
    constructor() {
        this.tile = new Tile('r0045', 0, 0);
        this.car = new Car(this.tile, ['colorId']);
        this.car.typeId = 1;
        this.car.driver = new DriverMock();
        this.otherCar = new Car(this.tile, ['colorId']);

        this.testInit();
        this.testGetFrameIndex();
        this.testGetNextHead();
        this.testGetClosestHead();
        this.testGetNextTurn();
        this.testIsInFront();
        this.testGetHeadFromDxDy();
        this.testGetMaxDistancePerStep();
        this.testCollideWith();
        this.testParkNow();

        this.testCallbackPark();
        this.testCallbackAtStop();
        this.testCallbackLeaveParkingLot();
        this.testCallbackEnterParkingLot();
        this.testCallbackChangeLane();
        this.testCallbackProceedToTargetLane();
        this.testCallbackDrive();
        this.testCallbackWait();
    }

    testInit() {
        console.assert(this.car.colorId === 'colorId');
        console.assert([60, 120, 240, 300].includes(this.car.head));
    }

    testGetFrameIndex() {
        console.assert(this.car.getFrameIndex(60) === 24);
    }

    testGetNextHead() {
        this.car.head = 60;
        console.assert(this.car.getNextHead(1) === 75);
        console.assert(this.car.getNextHead(-1) === 45);
        console.assert(this.car.getNextHead(8) === 240);
        console.assert(this.car.getNextHead(-9) === 225);
    }

    testGetClosestHead() {
        console.assert(this.car.getClosestHead(240, false) === 240);
        console.assert(this.car.getClosestHead(245, false) === 240);
        console.assert(this.car.getClosestHead(314, false) === 315);
        console.assert(this.car.getClosestHead(359, false) === 0);
        console.assert(this.car.getClosestHead(10, false) === 0);
        console.assert(this.car.getClosestHead(225, false) === 225);
        console.assert(this.car.getClosestHead(239, false) === 240);

        console.assert(this.car.getClosestHead(240, true) === 240);
        console.assert(this.car.getClosestHead(254, true) === 240);
        console.assert(this.car.getClosestHead(359, true) === 315);
        console.assert(this.car.getClosestHead(0, true) === 0);
        console.assert(this.car.getClosestHead(44, true) === 0);
        console.assert(this.car.getClosestHead(225, true) === 225);
        console.assert(this.car.getClosestHead(239, true) === 225);
    }

    testGetNextTurn() {
        var tile1 = new Tile('r0021', -20, -20);
        var tile2 = new Tile('r0081', -20, 20);
        var tile3 = new Tile('r0053', 20, 20);
        var tile4 = new Tile('r0017', 20, -20);
        var tiles = [this.car.tile, tile1, tile2, tile3, tile4];
        this.car.tile.computeAllNeighbours(tiles);
        this.car.tile.computeStreetNeighboursAndConnections();
        this.car.oldTile = tile2.hash;
        var res = this.car.getNextTurn();
        console.assert(res.includes(60));
        console.assert(res.includes(120));
        console.assert(res.includes(300));
    }

    testIsInFront() {
        var other = {};
        other.x = 1;
        other.y = 0;
        console.assert(this.car.isInFront(other, 0, 0, 50));
        console.assert(this.car.isInFront(other, 0, 0, 90));
        console.assert(!this.car.isInFront(other, 0, 0, 200));
        console.assert(!this.car.isInFront(other, 0, 0, 350));
    }

    testGetHeadFromDxDy() {
        console.assert(this.car.getHeadFromDxDy(0, -1) === 0);
        console.assert(this.car.getHeadFromDxDy(1, -1) === 45);
        console.assert(this.car.getHeadFromDxDy(1, 1) === 135);
        console.assert(this.car.getHeadFromDxDy(0, 1) === 180);
        console.assert(this.car.getHeadFromDxDy(-1, 0) === 270);
    }

    testGetMaxDistancePerStep() {
        this.car.v = 0;
        console.assert(this.car.getMaxDistancePerStep() === 0);
        this.car.v = config.World.stepsPerSecond * 1.5;
        console.assert(this.car.getMaxDistancePerStep() === 2);
    }

    testCollideWith() {
        this.otherCar.error = true;
        console.assert(!this.car.collideWith(this.otherCar));
        console.assert(!this.car.collideWith(this.car));
        this.otherCar.error = false;
        this.otherCar.v = 0;
        this.otherCar.queue = [this.otherCar.callbackPark];
        this.car.sprite = new SpriteMock();
        this.otherCar.sprite = new SpriteMock();
        console.assert(!this.car.collideWith(this.otherCar));
        this.otherCar.v = 10;
        this.otherCar.queue = [this.otherCar.callbackDrive];
        this.car.head = 60;
        this.otherCar.x = this.car.x + 10;
        this.otherCar.y = this.car.y - 10;
        var check = [false, false, false, false, false, true, true, true, true, true, true, true, false, false, false, false];
        for (var i = 0; i < config.Vehicle.headingOrder.length; i++) {
            this.otherCar.head = config.Vehicle.headingOrder[i];
            console.assert(this.car.collideWith(this.otherCar) === check[i]);
        }
    }

    testParkNow() {
        this.car.tile = new Tile('r0017', 0, 0);
        this.car.head = 60;
        this.car.queue = [this.car.callbackLeaveParkingLot, this.car.callbackDrive];
        this.car.parkNow();
        console.assert(this.car.queue[0] === this.car.callbackLeaveParkingLot);
        this.car.queue = [this.car.callbackDrive];
        this.car.parkNow();
        console.assert(this.car.queue.length === 1);
        console.assert(this.car.queue[0] === this.car.callbackEnterParkingLot);
        this.car.tile = this.tile;
    }

    testCallbackPark() {
        this.car.queue = [];
        var res = this.car.callbackPark();
        console.assert(this.car.v === 0);
        console.assert(this.car.queue.length === 1);
        console.assert(this.car.queue[0] === this.car.callbackLeaveParkingLot);
        console.assert(res);
    }

    testCallbackAtStop() {
        var res = this.car.callbackAtStop();
        console.assert(this.car.v === 0);
        console.assert(this.car.queue.length === 2);
        console.assert(this.car.queue[1] === this.car.callbackDrive);
        console.assert(res);
    }

    testCallbackLeaveParkingLot() {
        this.car.queue = [];
        var res = this.car.callbackLeaveParkingLot();
        console.assert(this.car.queue.length === 3);
        console.assert(this.car.queue[2] === this.car.callbackDrive);
        console.assert(res);

        this.car.tile.cars = [],
        this.car.tile.addVehicle(this.otherCar);
        this.otherCar.head = this.car.head;
        this.otherCar.queue = [this.otherCar.callbackDrive];
        var res = this.car.callbackLeaveParkingLot();
        console.assert(!res);
    }

    testCallbackEnterParkingLot() {
        this.car.queue = [];
        var res = this.car.callbackEnterParkingLot();
        console.assert(this.car.queue.length === 3);
        console.assert(this.car.queue[2] === this.car.callbackPark);
        console.assert(res);
    }

    testCallbackChangeLane() {
        var head = this.car.head;
        var res = this.car.callbackChangeLane(-2);
        console.assert(this.car.getNextHead(4) === head);
        console.assert(res);
    }

    testCallbackProceedToTargetLane() {
        this.tile.getDistanceToLane = function(a,b,c,d) {
            return 0;
        };
        var res = this.car.callbackProceedToTargetLane(300, 0);
        console.assert(this.car.v === config.Vehicle.velocityTurn);
        console.assert(this.car.head === 300);
        console.assert(res);
        this.tile.getDistanceToLane = function(a,b,c,d) {
            return 100;
        };
        var res = this.car.callbackProceedToTargetLane(300, 0);
        console.assert(!res);
    }

    testCallbackDrive() {
        this.car.queue = [this.car.callbackDrive];
        this.car.tile.cars = [];
        this.car.tile.addVehicle(this.otherCar);
        this.car.tile.addVehicle(this.car);
        var res = this.car.callbackDrive();
        console.assert(!res);
        console.assert(this.car.v === 0);
    }

    testCallbackWait() {
        var res = this.car.callbackWait();
        console.assert(res);
    }
}
