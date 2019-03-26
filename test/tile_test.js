class TileTest {
    constructor() {
        this.tile_grass = new Tile('g0000', 0, 0);
        this.tile_house = new Tile('h0001', 0, 0);
        this.tile_road = {};
        this.tile_road[1] = new Tile('r0001', 0, 0);
        this.tile_road[5] = new Tile('r0005', 0, 0);
        this.tile_road[9] = new Tile('r0009', 0, 0);
        this.tile_road[13] = new Tile('r0013', 0, 0);
        this.tile_road[17] = new Tile('r0017', 0, 0);
        this.tile_road[21] = new Tile('r0021', 0, 0);
        this.tile_road[45] = new Tile('r0045', 0, 0);
        this.tile_road[49] = new Tile('r0049', 0, 0);
        this.tile_road[53] = new Tile('r0053', 0, 0);
        this.tile_road[57] = new Tile('r0057', 0, 0);
        this.tile_road[61] = new Tile('r0061', 0, 0);
        this.tile_road[65] = new Tile('r0065', 0, 0);
        this.tile_road[69] = new Tile('r0069', 0, 0);
        this.tile_road[73] = new Tile('r0073', 0, 0);
        this.tile_road[77] = new Tile('r0077', 0, 0);
        this.tile_road[81] = new Tile('r0081', 0, 0);
        this.tile_road[85] = new Tile('r0085', 0, 0);

        var tile = new Tile('r0001', 0, 0);
        tile.computeStreetConnections();
        this.car1 = new Car(tile, [1]);
        this.car2 = new Car(tile, [2]);

        this.testIsGrass();
        this.testIsStreet();
        this.testIsStraight();
        this.testIsHighway();
        this.testIsStraightOrCurve();
        this.testIsJunctionOrCrossing();
        this.testIsDeadEnd();
        this.testComputeAllNeighbours();
        this.testComputeStreetNeighbours();
        this.testComputeStreetConnections();
        this.testInside();
        this.testCenterAhead();
        this.testGetLane();
        this.testGetClosestPointInLane();
        this.testGetDistanceToLane();
        this.testGetLaneTargetPoint();
        this.testAddCar();
        this.testGetCarIndex();
        this.testRemoveCar();
        this.testHasFreeParkingLot();
    }

    testIsGrass() {
        console.assert(this.tile_grass.isGrass());
        console.assert(!this.tile_house.isGrass());
        console.assert(!this.tile_road[1].isGrass());
    }

    testIsStreet() {
        console.assert(!this.tile_grass.isStreet());
        console.assert(!this.tile_house.isStreet());
        console.assert(this.tile_road[1].isStreet());
    }

    testIsStraight() {
        console.assert(!this.tile_grass.isStraight());
        console.assert(!this.tile_house.isStraight());
        console.assert(!this.tile_road[1].isStraight());
        console.assert(!this.tile_road[5].isStraight());
        console.assert(!this.tile_road[9].isStraight());
        console.assert(!this.tile_road[13].isStraight());
        console.assert(this.tile_road[17].isStraight());
        console.assert(this.tile_road[21].isStraight());
        console.assert(!this.tile_road[45].isStraight());
        console.assert(!this.tile_road[49].isStraight());
        console.assert(!this.tile_road[53].isStraight());
        console.assert(!this.tile_road[57].isStraight());
        console.assert(!this.tile_road[61].isStraight());
        console.assert(!this.tile_road[65].isStraight());
        console.assert(!this.tile_road[69].isStraight());
        console.assert(!this.tile_road[73].isStraight());
        console.assert(!this.tile_road[77].isStraight());
        console.assert(this.tile_road[81].isStraight());
        console.assert(this.tile_road[85].isStraight());
    }

    testIsHighway() {
        console.assert(!this.tile_grass.isHighway());
        console.assert(!this.tile_house.isHighway());
        console.assert(!this.tile_road[1].isHighway());
        console.assert(!this.tile_road[5].isHighway());
        console.assert(!this.tile_road[9].isHighway());
        console.assert(!this.tile_road[13].isHighway());
        console.assert(!this.tile_road[17].isHighway());
        console.assert(!this.tile_road[21].isHighway());
        console.assert(!this.tile_road[45].isHighway());
        console.assert(!this.tile_road[49].isHighway());
        console.assert(!this.tile_road[53].isHighway());
        console.assert(!this.tile_road[57].isHighway());
        console.assert(!this.tile_road[61].isHighway());
        console.assert(!this.tile_road[65].isHighway());
        console.assert(!this.tile_road[69].isHighway());
        console.assert(!this.tile_road[73].isHighway());
        console.assert(!this.tile_road[77].isHighway());
        console.assert(this.tile_road[81].isHighway());
        console.assert(this.tile_road[85].isHighway());
    }

    testIsStraightOrCurve() {
        for (var key in this.tile_road) {
            this.tile_road[key].connections = [];
            this.tile_road[key].computeStreetConnections();
        }
        console.assert(!this.tile_road[1].isStraightOrCurve());
        console.assert(!this.tile_road[5].isStraightOrCurve());
        console.assert(!this.tile_road[9].isStraightOrCurve());
        console.assert(!this.tile_road[13].isStraightOrCurve());
        console.assert(this.tile_road[17].isStraightOrCurve());
        console.assert(this.tile_road[21].isStraightOrCurve());
        console.assert(!this.tile_road[45].isStraightOrCurve());
        console.assert(this.tile_road[49].isStraightOrCurve());
        console.assert(this.tile_road[53].isStraightOrCurve());
        console.assert(this.tile_road[57].isStraightOrCurve());
        console.assert(this.tile_road[61].isStraightOrCurve());
        console.assert(!this.tile_road[65].isStraightOrCurve());
        console.assert(!this.tile_road[69].isStraightOrCurve());
        console.assert(!this.tile_road[73].isStraightOrCurve());
        console.assert(!this.tile_road[77].isStraightOrCurve());
        console.assert(this.tile_road[81].isStraightOrCurve());
        console.assert(this.tile_road[85].isStraightOrCurve());
    }

    testIsJunctionOrCrossing() {
        for (var key in this.tile_road) {
            this.tile_road[key].connections = [];
            this.tile_road[key].computeStreetConnections();
        }
        console.assert(this.tile_road[1].isJunctionOrCrossing());
        console.assert(this.tile_road[5].isJunctionOrCrossing());
        console.assert(this.tile_road[9].isJunctionOrCrossing());
        console.assert(this.tile_road[13].isJunctionOrCrossing());
        console.assert(!this.tile_road[17].isJunctionOrCrossing());
        console.assert(!this.tile_road[21].isJunctionOrCrossing());
        console.assert(this.tile_road[45].isJunctionOrCrossing());
        console.assert(!this.tile_road[49].isJunctionOrCrossing());
        console.assert(!this.tile_road[53].isJunctionOrCrossing());
        console.assert(!this.tile_road[57].isJunctionOrCrossing());
        console.assert(!this.tile_road[61].isJunctionOrCrossing());
        console.assert(!this.tile_road[65].isJunctionOrCrossing());
        console.assert(!this.tile_road[69].isJunctionOrCrossing());
        console.assert(!this.tile_road[73].isJunctionOrCrossing());
        console.assert(!this.tile_road[77].isJunctionOrCrossing());
        console.assert(!this.tile_road[81].isJunctionOrCrossing());
        console.assert(!this.tile_road[85].isJunctionOrCrossing());
    }

    testIsDeadEnd() {
        for (var key in this.tile_road) {
            this.tile_road[key].connections = [];
            this.tile_road[key].computeStreetConnections();
        }
        console.assert(!this.tile_road[1].isDeadEnd());
        console.assert(!this.tile_road[5].isDeadEnd());
        console.assert(!this.tile_road[9].isDeadEnd());
        console.assert(!this.tile_road[13].isDeadEnd());
        console.assert(!this.tile_road[17].isDeadEnd());
        console.assert(!this.tile_road[21].isDeadEnd());
        console.assert(!this.tile_road[45].isDeadEnd());
        console.assert(!this.tile_road[49].isDeadEnd());
        console.assert(!this.tile_road[53].isDeadEnd());
        console.assert(!this.tile_road[57].isDeadEnd());
        console.assert(!this.tile_road[61].isDeadEnd());
        console.assert(this.tile_road[65].isDeadEnd());
        console.assert(this.tile_road[69].isDeadEnd());
        console.assert(this.tile_road[73].isDeadEnd());
        console.assert(this.tile_road[77].isDeadEnd());
        console.assert(!this.tile_road[81].isDeadEnd());
        console.assert(!this.tile_road[85].isDeadEnd());
    }

    testComputeAllNeighbours() {
        var tile = new Tile('g0000', 0, 0);
        var tile1 = new Tile('g0000', -20, -20);
        var tile2 = new Tile('g0000', -20, 20);
        var tile3 = new Tile('g0000', 20, 20);
        var tile4 = new Tile('g0000', 20, -20);
        var tiles = [tile, tile1, tile2, tile3, tile4];

        tile.computeAllNeighbours(tiles);
        console.assert(tile.neighbours.length === 4);
        console.assert(!tile.neighbours.includes(tile));
    }

    testComputeStreetNeighbours() {
        var tile = new Tile('r0045', 0, 0);
        var tile1 = new Tile('r0021', -20, -20);
        var tile2 = new Tile('r0081', -20, 20);
        var tile3 = new Tile('r0053', 20, 20);
        var tile4 = new Tile('r0017', 20, -20);
        var tiles = [tile, tile1, tile2, tile3, tile4];
        tile.computeAllNeighbours(tiles);
        tiles.forEach(function (t) {
            t.computeStreetConnections();
        });
        tile.computeStreetNeighbours(tiles);

        console.assert(tile.streetNeighbours.includes(tile1));
        console.assert(tile.streetNeighbours.includes(tile2));
        console.assert(tile.streetNeighbours.includes(tile3));
        console.assert(tile.streetNeighbours.includes(tile4));
        console.assert(tile.getNeighbourConnection(tile1) === 300);
        console.assert(tile.getNeighbourConnection(tile2) === 240);
        console.assert(tile.getNeighbourConnection(tile3) === 120);
        console.assert(tile.getNeighbourConnection(tile4) === 60);
    }

    testComputeStreetConnections() {
        this.tile_road[45].computeStreetConnections();
        console.assert(this.tile_road[45].connections.includes(60));
        console.assert(this.tile_road[45].connections.includes(120));
        console.assert(this.tile_road[45].connections.includes(240));
        console.assert(this.tile_road[45].connections.includes(300));
    }

    testInside() {
        var x = this.tile_grass.x;
        var y = this.tile_grass.y;
        console.assert(this.tile_grass.inside(x, y));
        console.assert(this.tile_grass.inside(x+20, y+20, 1));
        console.assert(!this.tile_grass.inside(x+20, y+20, 0.1));
        console.assert(!this.tile_grass.inside(x+100, y+100, 1));
    }

    testCenterAhead() {
        var x = this.tile_road[45].x;
        console.assert(this.tile_road[45].centerAhead(x-10, 90));
        console.assert(!this.tile_road[45].centerAhead(x+10, 90));
        console.assert(!this.tile_road[45].centerAhead(x-10, 270));
        console.assert(this.tile_road[45].centerAhead(x+10, 270));
    }

    testGetLane() {
        var lane = this.tile_road[17].getLane(60, 8);
        console.assert(lane.px === this.tile_road[17].x);
        console.assert(lane.py === this.tile_road[17].y + 8);
        console.assert(Math.abs(lane.nx - 0.5) < 0.001);
        console.assert(Math.abs(lane.ny - 0.866) < 0.001);
    }

    testGetClosestPointInLane() {
        var x = this.tile_road[45].x;
        var y = this.tile_road[45].y;
        var point = this.tile_road[45].getClosestPointInLane(x, y, 60, 0);
        console.assert(point.x === x);
        console.assert(point.y === y);
        var point = this.tile_road[45].getClosestPointInLane(x+5, y+3, 45, 0);
        console.assert(point.x === x+1);
        console.assert(point.y === y-1);
        var point = this.tile_road[45].getClosestPointInLane(x-3, y-5, 45, 0);
        console.assert(point.x === x+1);
        console.assert(point.y === y-1);
        var point = this.tile_road[45].getClosestPointInLane(x+3, y-3, 45, 0);
        console.assert(point.x === x+3);
        console.assert(point.y === y-3);
    }

    testGetDistanceToLane() {
        var x = this.tile_road[45].x;
        var y = this.tile_road[45].y;
        var distance = this.tile_road[45].getDistanceToLane(x, y, 60, 0);
        console.assert(distance === 0);
        var distance = this.tile_road[45].getDistanceToLane(x+5, y+3, 45, 0);
        console.assert(distance == Math.sqrt(32));
        var distance = this.tile_road[45].getDistanceToLane(x-3, y-5, 45, 0);
        console.assert(distance == Math.sqrt(32));
        var distance = this.tile_road[45].getDistanceToLane(x+3, y-3, 45, 0);
        console.assert(distance === 0);
    }

    testGetLaneTargetPoint() {
        var point1 = this.tile_road[45].getLaneTargetPoint(45, 0);
        var point2 = this.tile_road[45].getLaneTargetPoint(225, 0);
        var x1 = 5 * (point1.x-this.tile_road[45].x) / Math.sqrt(2);
        var y1 = 5 * (point1.y-this.tile_road[45].y) / Math.sqrt(2);
        var x2 = 5 * (point2.x-this.tile_road[45].x) / Math.sqrt(2);
        var y2 = 5 * (point2.y-this.tile_road[45].y) / Math.sqrt(2);
        console.assert(x1 > 0);
        console.assert(y1 < 0);
        console.assert(x2 < 0);
        console.assert(y2 > 0);
        console.assert(Math.abs(x1 - config.Tile.width/2) < 0.01);
        console.assert(Math.abs(-y1 - config.Tile.width/2) < 0.01);
        console.assert(Math.abs(-x2 - config.Tile.width/2) < 0.01);
        console.assert(Math.abs(y2 - config.Tile.width/2) < 0.01);
    }

    testAddCar() {
        this.tile_road[1].addCar(this.car1);
        this.tile_road[1].addCar(this.car2);
        console.assert(this.tile_road[1].cars.length === 2);
        console.assert(this.tile_road[1].carHashes.length === 2);
        console.assert(this.tile_road[1].carHashes[0] === this.car1.hash);
        console.assert(this.tile_road[1].carHashes[1] === this.car2.hash);
    }

    testGetCarIndex() {
        var index = this.tile_road[1].getCarIndex(this.car2);
        console.assert(index === 1);
    }

    testRemoveCar() {
        this.tile_road[1].removeCar(this.car1);
        console.assert(this.tile_road[1].cars.length === 1);
        console.assert(this.tile_road[1].carHashes.length === 1);
        console.assert(this.tile_road[1].carHashes[0] === this.car2.hash);
    }

    testHasFreeParkingLot() {
        console.assert(!this.tile_road[1].hasFreeParkingLot(0));
        console.assert(!this.tile_road[5].hasFreeParkingLot(0));
        console.assert(!this.tile_road[9].hasFreeParkingLot(0));
        console.assert(!this.tile_road[13].hasFreeParkingLot(0));
        console.assert(!this.tile_road[17].hasFreeParkingLot(0));
        console.assert(!this.tile_road[21].hasFreeParkingLot(0));
        console.assert(!this.tile_road[45].hasFreeParkingLot(0));
        console.assert(!this.tile_road[49].hasFreeParkingLot(0));
        console.assert(!this.tile_road[53].hasFreeParkingLot(0));
        console.assert(!this.tile_road[57].hasFreeParkingLot(0));
        console.assert(!this.tile_road[61].hasFreeParkingLot(0));
        console.assert(!this.tile_road[65].hasFreeParkingLot(0));
        console.assert(!this.tile_road[69].hasFreeParkingLot(0));
        console.assert(!this.tile_road[73].hasFreeParkingLot(0));
        console.assert(!this.tile_road[77].hasFreeParkingLot(0));
        console.assert(!this.tile_road[81].hasFreeParkingLot(0));
        console.assert(!this.tile_road[85].hasFreeParkingLot(0));

        console.assert(this.tile_road[17].hasFreeParkingLot(60));
        console.assert(this.tile_road[21].hasFreeParkingLot(120));
        this.car1.queue = [this.car1.callbackPark];
        this.car1.head = 60;
        this.tile_road[17].cars.push(this.car1);
        console.assert(!this.tile_road[17].hasFreeParkingLot(60));
    }
}
