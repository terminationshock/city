class DriverMock {
    leaveParkingLot() {
        return true;
    }
}

class CarTest {
    constructor() {
        this.tile = new Tile('r0045', 0, 0);
        this.tile.connections = [60];
        this.car = new Car(this.tile, ['colorId']);
        this.car.typeId = 1;
        this.car.driver = new DriverMock();

        this.testInit();
        this.testGetFrameIndex();
        this.testGetNextHead();
        this.testIsInFront();
        this.testGetHeadFromDxDy();

        this.testCallbackPark();
    }

    testInit() {
        console.assert(this.car.colorId === 'colorId');
        console.assert(this.car.head === 60);
    }

    testGetFrameIndex() {
        console.assert(this.car.getFrameIndex() === 24);
    }

    testGetNextHead() {
        console.assert(this.car.getNextHead(1) === 75);
        console.assert(this.car.getNextHead(-1) === 45);
        console.assert(this.car.getNextHead(8) === 240);
        console.assert(this.car.getNextHead(-9) === 225);
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

    testCallbackPark() {
        var res = this.car.callbackPark();
        console.assert(this.car.v === 0);
        console.assert(this.car.queue.length === 2);
        console.assert(this.car.queue[1] === this.car.callbackLeaveParkingLot);
        console.assert(res);
    }
}
