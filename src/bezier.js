class BezierCurve {
    constructor(anchorPoints) {
        this.anchorPoints = anchorPoints;
    }

    get(t) {
        var n = this.anchorPoints.length;
        var point = Array(n);
        var i = null;
        var j = null;
        for (i = 0; i < n; i++) {
            point[i] = Array(n);
        }
        for (i = 0; i < n; i++) {
            point[i][0] = this.anchorPoints[i];
        }
        var x = 0;
        var y = 0;
        for (j = 1; j < n; j++) {
            var nj = n - j;
            for (i = 0; i < nj; i++) {
                x = (1. - t) * point[i][j - 1].x + t * point[i + 1][j - 1].x;
                y = (1. - t) * point[i][j - 1].y + t * point[i + 1][j - 1].y;
                point[i][j] = new Point(x, y);
            }
        }
        return point[0][n - 1];
    }

    getPath(wayPerStep) {
        var path = [];

        var t0 = 0;
        var point1 = this.anchorPoints[0];
        var point2 = null;

        var t = null;
        var dxy = null;
        var dx = null;
        var dy = null;
        var angle = null;
        var p = null;
        while (t0 < 1) {
            t = t0;
            dxy = 0;
            dx = 0;
            dy = 0;
            while (dxy < wayPerStep) {
                t += 0.005;

                point2 = this.get(t);
                dx = point2.x - point1.x;
                dy = point2.y - point1.y;
                dxy = Math.sqrt(dx * dx + dy * dy);
            }

            angle = Math.atan2(dx, -dy) * 180 / Math.PI;
            if (angle < 0) {
                angle += 360;
            }

            p = new Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
            p.head = angle;
            path.push(p);

            point1 = new Point(point2.x, point2.y);
            t0 = t;
        }

        return path.slice(0, path.length - 1);
    }
};
