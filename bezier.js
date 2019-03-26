class BezierCurve {
    constructor(anchorPoints) {
        this.anchorPoints = anchorPoints;
    }

    get(t) {
        var n = this.anchorPoints.length;
        var point = Array(n);
        for (var i = 0; i < n; i++) {
            point[i] = Array(n);
        }
        for (var i = 0; i < n; i++) {
            point[i][0] = this.anchorPoints[i];
        }
        for (var j = 1; j < n; j++) {
            for (var i = 0; i < n-j; i++) {
                var x = (1.-t) * point[i][j-1].x + t * point[i+1][j-1].x;
                var y = (1.-t) * point[i][j-1].y + t * point[i+1][j-1].y;
                point[i][j] = new Point(x, y);
            }
        }
        return point[0][n-1];
    }

    getPath(wayPerStep) {
        var path = [];

        var t0 = 0;
        var point1 = this.anchorPoints[0];
        var point2 = null;

        while (t0 < 1) {
            var t = t0;
            var dxy = 0;
            var dx = 0;
            var dy = 0;
            while (dxy < wayPerStep) {
                t += 0.005;

                point2 = this.get(t);
                dx = point2.x - point1.x;
                dy = point2.y - point1.y;
                dxy = Math.sqrt(dx**2 + dy**2);
            }

            var angle = Math.atan2(dx, -dy) * 180/Math.PI;
            if (angle < 0) {
                angle += 360;
            }

            var p = new Point((point1.x + point2.x)/2, (point1.y + point2.y)/2);
            p.head = angle;
            path.push(p);

            point1 = new Point(point2.x, point2.y);
            t0 = t;
        }

        return path.slice(0, path.length-1);
    }
}
