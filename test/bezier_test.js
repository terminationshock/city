class BezierCurveTest {
    constructor() {
        this.testLine();
    }

    testLine() {
        var bezier = new BezierCurve([new Point(0,0), new Point(1,1)]);
        var path = bezier.getPath(0.5);
        var d = 0.5 / Math.sqrt(2);
        assertTrue(path.length === 2);
        assertTrue(Math.abs(path[0].x - d/2) < 0.01);
        assertTrue(Math.abs(path[0].y - d/2) < 0.01);
        assertTrue(Math.abs(path[1].x - 3*d/2) < 0.01);
        assertTrue(Math.abs(path[1].y - 3*d/2) < 0.01);
        assertTrue(path[0].head === 135);
        assertTrue(path[1].head === 135);
    }
}
