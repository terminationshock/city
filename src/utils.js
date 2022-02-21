/* This file is part of City.

 * City is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * City is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with City.  If not, see <http://www.gnu.org/licenses/>.
*/

function convertInt(input) {
    return parseInt(input, 10);
}

function generateRandomId() {
    var id = '';
    id += Math.random().toString(36).substr(2, 5);
    id += Math.random().toString(36).substr(2, 5);
    id += Math.random().toString(36).substr(2, 5);
    return id;
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

    var bezierFactorDelta = bezierFactor * deltaHead;
    if (deltaHead === 0) {
        return new BezierCurve([p1, p2]);
    }
    return new BezierCurve([p1,
                            new Point(p1.x + bezierFactorDelta * dx1, p1.y + bezierFactorDelta * dy1),
                            new Point(p2.x - bezierFactorDelta * dx2, p2.y - bezierFactorDelta * dy2),
                            p2]);
}
