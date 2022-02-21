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
