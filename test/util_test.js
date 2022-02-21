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

    arraysEqual(x, y) {
        return JSON.stringify(x) === JSON.stringify(y);
    }
}
