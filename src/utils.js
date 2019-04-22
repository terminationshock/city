function convertInt(input) {
    return parseInt(input, 10);
}

function normalizeAngle(angle) {
    if (angle >= 360) {
        angle -= 360;
    }
    return angle;
}

function generateRandomId() {
    var id = '';
    id += Math.random().toString(36).substr(2, 5);
    id += Math.random().toString(36).substr(2, 5);
    id += Math.random().toString(36).substr(2, 5);
    return id;
}

function getClassOf(instance) {
    return instance.constructor.name;
}

function getTurnDirection(fromHead, toHead) {
    if (0 < toHead - fromHead && toHead - fromHead < 180) {
        return 1;
    } else if (-180 <= toHead - fromHead && toHead - fromHead < 0) {
        return -1;
    } else if (toHead - fromHead >= 180) {
        return -1;
    } else if (-180 > toHead - fromHead) {
        return 1;
    }
    return 0;
}

function getDeltaHead(fromHead, toHead) {
    var turn = getTurnDirection(fromHead, toHead);

    var deltaHead = 0;
    if (turn < 0) {
        if (toHead > fromHead) {
            deltaHead = fromHead - (toHead - 360);
        } else {
            deltaHead = fromHead - toHead;
        }
    } else if (turn > 0) {
        if (toHead < fromHead) {
            deltaHead = (toHead + 360) - fromHead;
        } else {
            deltaHead = toHead - fromHead;
        }
    }
    return deltaHead;
}

function getCurve(p1, p2, head1, head2, bezierFactor) {
    var dx1 = Math.sin(head1 * Math.PI / 180);
    var dy1 = -Math.cos(head1 * Math.PI / 180);

    var dx2 = Math.sin(head2 * Math.PI / 180);
    var dy2 = -Math.cos(head2 * Math.PI / 180);

    var deltaHead = getDeltaHead(head1, head2);

    var bezierFactor = bezierFactor * deltaHead;
    if (deltaHead === 0) {
        return new BezierCurve([p1, p2]);
    }
    return new BezierCurve([p1,
                            new Point(p1.x + bezierFactor * dx1, p1.y + bezierFactor * dy1),
                            new Point(p2.x - bezierFactor * dx2, p2.y - bezierFactor * dy2),
                            p2]);
}

function linesAreEqual(line1, line2) {
    if (line1.length !== line2.length) {
        return false;
    }
    for (var i = 0; i < line1.length; i++) {
        if (line1[i].start.x !== line2[i].start.x || line1[i].start.y !== line2[i].start.y) {
            return false;
        }
        if (line1[i].end.x !== line2[i].end.x || line1[i].end.y !== line2[i].end.y) {
            return false;
        }
    }
    return true;
}

function linesIntersectInside(lines, tile) {
    for (var i = 0; i < lines.length; i++) {
        for (var j = i+1; j < lines.length; j++) {
            if (!linesAreEqual(lines[i], lines[j])) {
                for (var line1 of lines[i]) {
                    for (var line2 of lines[j]) {
                        var point = Phaser.Line.intersects(line1, line2);
                        if (point !== null && tile.inside(point.x, point.y, 0.99)) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(x, y) {
        return this.x === x && this.y === y;
    }
};
