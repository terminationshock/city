class UtilTest {
    constructor() {
        this.testGetTurnDirection();
        this.testGetDeltaHead();
        this.testGetPermutations();
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

    arraysEqual(x, y) {
        return JSON.stringify(x) === JSON.stringify(y);
    }

    testGetPermutations() {
        var a = [0, 1, 2, 3, 4, 5, 6];
        assertTrue(getPermutations(a, 1).length === 1);
        assertTrue(getPermutations(a, 2).length === 2);
        assertTrue(getPermutations(a, 3).length === 3);
        assertTrue(this.arraysEqual(getPermutations(a, 1)[0], a));
        assertTrue(this.arraysEqual(getPermutations(a, 2)[0], a));
        assertTrue(this.arraysEqual(getPermutations(a, 3)[0], a));
        assertTrue(this.arraysEqual(getPermutations(a, 2)[1], [3, 4, 5, 6, 0, 1, 2]))
        assertTrue(this.arraysEqual(getPermutations(a, 3)[1], [2, 3, 4, 5, 6, 0, 1]))
        assertTrue(this.arraysEqual(getPermutations(a, 3)[2], [4, 5, 6, 0, 1, 2, 3]))
    }
}
