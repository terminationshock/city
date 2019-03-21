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
        this.testComputeAllNeighbours();
        this.testComputeStreetNeighbours();
        this.testComputeStreetConnections();
        this.testInside();
        this.testGetLane();
        this.testGetClosestPointInLane();
        this.testDistanceToLane();
        this.testAddCar();
        this.testGetCarIndex();
        this.testRemoveCar();
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

    testDistanceToLane() {
        var x = this.tile_road[45].x;
        var y = this.tile_road[45].y;
        var distance = this.tile_road[45].distanceToLane(x, y, 60, 0);
        console.assert(distance === 0);
        var distance = this.tile_road[45].distanceToLane(x+5, y+3, 45, 0);
        console.assert(distance == Math.sqrt(32));
        var distance = this.tile_road[45].distanceToLane(x-3, y-5, 45, 0);
        console.assert(distance == Math.sqrt(32));
        var distance = this.tile_road[45].distanceToLane(x+3, y-3, 45, 0);
        console.assert(distance === 0);
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
}
