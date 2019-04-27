class UtilTest {
    constructor() {
        this.testGetTurnDirection();
        this.testGetDeltaHead();
    }

    testGetTurnDirection() {
        assertTrue(getTurnDirection(0, 90) === 1);
        assertTrue(getTurnDirection(0, 270) === -1);
        assertTrue(getTurnDirection(90, 180) === 1);
        assertTrue(getTurnDirection(90, 0) === -1);
        assertTrue(getTurnDirection(180, 270) === 1);
        assertTrue(getTurnDirection(180, 90) === -1);
        assertTrue(getTurnDirection(270, 0) === 1);
        assertTrue(getTurnDirection(270, 180) === -1);
    }

    testGetDeltaHead() {
        assertTrue(getDeltaHead(0, 90) === 90);
        assertTrue(getDeltaHead(90, 0) === 90);
        assertTrue(getDeltaHead(0, 180) === 180);
        assertTrue(getDeltaHead(180, 0) === 180);
        assertTrue(getDeltaHead(0, 270) === 90);
        assertTrue(getDeltaHead(270, 0) === 90);
        assertTrue(getDeltaHead(359, 1) === 2);
        assertTrue(getDeltaHead(1, 359) === 2);
        assertTrue(getDeltaHead(1, 0) === 1);
        assertTrue(getDeltaHead(359, 0) === 1);
    }
}
