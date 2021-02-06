class TileTest {
    constructor() {
        this.tile_grass = new Tile('g0000', '00', 0, 0);
        this.tile_house = new Tile('h0001', '01', 0, 0);
        this.tile_road = {};
        this.tile_road[1] = new Tile('r0001', '02', 0, 0);
        this.tile_road[5] = new Tile('r0005', '03', 0, 0);
        this.tile_road[9] = new Tile('r0009', '04', 0, 0);
        this.tile_road[13] = new Tile('r0013', '05', 0, 0);
        this.tile_road[17] = new Tile('r0017', '06', 0, 0);
        this.tile_road[21] = new Tile('r0021', '07', 0, 0);
        this.tile_road[45] = new Tile('r0045', '08', 0, 0);
        this.tile_road[49] = new Tile('r0049', '09', 0, 0);
        this.tile_road[53] = new Tile('r0053', '10', 0, 0);
        this.tile_road[57] = new Tile('r0057', '11', 0, 0);
        this.tile_road[61] = new Tile('r0061', '12', 0, 0);
        this.tile_road[65] = new Tile('r0065', '13', 0, 0);
        this.tile_road[69] = new Tile('r0069', '14', 0, 0);
        this.tile_road[73] = new Tile('r0073', '15', 0, 0);
        this.tile_road[77] = new Tile('r0077', '16', 0, 0);
        this.tile_road[81] = new Tile('r0081', '17', 0, 0);
        this.tile_road[85] = new Tile('r0085', '18', 0, 0);

        this.car1 = new Car(this.tile_road[21], 60, [1], 1);
        this.car2 = new Car(this.tile_road[21], 60, [2], 1);

        this.testIsGrass();
        this.testIsStreet();
        this.testIsStraight();
        this.testIsHighway();
        this.testIsCurve();
        this.testIsStraightOrCurve();
        this.testIsDeadEndOrJunctionOrCrossingStreet();
        this.testIsDeadEndOrJunctionOrCrossingStraight();
        this.testIsDeadEndOrJunctionOrCrossingCurve();
        this.testIsDeadEndOrJunctionOrCrossingGrass();
        this.testIsDeadEnd();
        this.testComputeAllNeighbours();
        this.testComputeStreetNeighboursAndConnections();
        this.testIsConnectedTo();
        this.testGetStreetConnections();
        this.testInside();
        this.testCenterAhead();
        this.testGetLane();
        this.testGetClosestPointInLane();
        this.testGetDistanceToLane();
        this.testGetLaneTargetPoint();
        this.testAddVehicle();
        this.testGetVehicleIndex();
        this.testRemoveVehicle();
        this.testHasFreeParkingLot();
    }

    testIsGrass() {
        assertTrue(this.tile_grass.isGrass());
        assertTrue(!this.tile_house.isGrass());
        assertTrue(!this.tile_road[1].isGrass());
    }

    testIsStreet() {
        assertTrue(!this.tile_grass.isStreet());
        assertTrue(!this.tile_house.isStreet());
        assertTrue(this.tile_road[1].isStreet());
    }

    testIsStraight() {
        assertTrue(!this.tile_grass.isStraight());
        assertTrue(!this.tile_house.isStraight());
        assertTrue(!this.tile_road[1].isStraight());
        assertTrue(!this.tile_road[5].isStraight());
        assertTrue(!this.tile_road[9].isStraight());
        assertTrue(!this.tile_road[13].isStraight());
        assertTrue(this.tile_road[17].isStraight());
        assertTrue(this.tile_road[21].isStraight());
        assertTrue(!this.tile_road[45].isStraight());
        assertTrue(!this.tile_road[49].isStraight());
        assertTrue(!this.tile_road[53].isStraight());
        assertTrue(!this.tile_road[57].isStraight());
        assertTrue(!this.tile_road[61].isStraight());
        assertTrue(!this.tile_road[65].isStraight());
        assertTrue(!this.tile_road[69].isStraight());
        assertTrue(!this.tile_road[73].isStraight());
        assertTrue(!this.tile_road[77].isStraight());
        assertTrue(this.tile_road[81].isStraight());
        assertTrue(this.tile_road[85].isStraight());
    }

    testIsHighway() {
        assertTrue(!this.tile_grass.isHighway());
        assertTrue(!this.tile_house.isHighway());
        assertTrue(!this.tile_road[1].isHighway());
        assertTrue(!this.tile_road[5].isHighway());
        assertTrue(!this.tile_road[9].isHighway());
        assertTrue(!this.tile_road[13].isHighway());
        assertTrue(!this.tile_road[17].isHighway());
        assertTrue(!this.tile_road[21].isHighway());
        assertTrue(!this.tile_road[45].isHighway());
        assertTrue(!this.tile_road[49].isHighway());
        assertTrue(!this.tile_road[53].isHighway());
        assertTrue(!this.tile_road[57].isHighway());
        assertTrue(!this.tile_road[61].isHighway());
        assertTrue(!this.tile_road[65].isHighway());
        assertTrue(!this.tile_road[69].isHighway());
        assertTrue(!this.tile_road[73].isHighway());
        assertTrue(!this.tile_road[77].isHighway());
        assertTrue(this.tile_road[81].isHighway());
        assertTrue(this.tile_road[85].isHighway());
    }

    testIsCurve() {
        assertTrue(!this.tile_grass.isCurve());
        assertTrue(!this.tile_house.isCurve());
        assertTrue(!this.tile_road[1].isCurve());
        assertTrue(!this.tile_road[5].isCurve());
        assertTrue(!this.tile_road[9].isCurve());
        assertTrue(!this.tile_road[13].isCurve());
        assertTrue(!this.tile_road[17].isCurve());
        assertTrue(!this.tile_road[21].isCurve());
        assertTrue(!this.tile_road[45].isCurve());
        assertTrue(this.tile_road[49].isCurve());
        assertTrue(this.tile_road[53].isCurve());
        assertTrue(this.tile_road[57].isCurve());
        assertTrue(this.tile_road[61].isCurve());
        assertTrue(!this.tile_road[65].isCurve());
        assertTrue(!this.tile_road[69].isCurve());
        assertTrue(!this.tile_road[73].isCurve());
        assertTrue(!this.tile_road[77].isCurve());
        assertTrue(!this.tile_road[81].isCurve());
        assertTrue(!this.tile_road[85].isCurve());
    }

    testIsStraightOrCurve() {
        assertTrue(!this.tile_road[1].isStraightOrCurve());
        assertTrue(!this.tile_road[5].isStraightOrCurve());
        assertTrue(!this.tile_road[9].isStraightOrCurve());
        assertTrue(!this.tile_road[13].isStraightOrCurve());
        assertTrue(this.tile_road[17].isStraightOrCurve());
        assertTrue(this.tile_road[21].isStraightOrCurve());
        assertTrue(!this.tile_road[45].isStraightOrCurve());
        assertTrue(this.tile_road[49].isStraightOrCurve());
        assertTrue(this.tile_road[53].isStraightOrCurve());
        assertTrue(this.tile_road[57].isStraightOrCurve());
        assertTrue(this.tile_road[61].isStraightOrCurve());
        assertTrue(!this.tile_road[65].isStraightOrCurve());
        assertTrue(!this.tile_road[69].isStraightOrCurve());
        assertTrue(!this.tile_road[73].isStraightOrCurve());
        assertTrue(!this.tile_road[77].isStraightOrCurve());
        assertTrue(this.tile_road[81].isStraightOrCurve());
        assertTrue(this.tile_road[85].isStraightOrCurve());
    }

    dictsEqual(x, y) {
        for (var key in x) {
            if (!(key in y)) return false;
            if (x[key].sort().toString() !== y[key].sort().toString()) return false;
        }
        for (var key in y) {
            if (!(key in x)) return false;
            if (x[key].sort().toString() !== y[key].sort().toString()) return false;
        }
        return true;
    }

    helperIsDeadEndOrJunctionOrCrossing(tile, falses, force_60) {
        var heads = [[60], [120], [240], [300], [60, 120], [60, 240], [60, 300], [120, 240], [120, 300], [240, 300], [60, 120, 240], [60, 120, 300], [60, 240, 300], [120, 240, 300], [60, 120, 240, 300]];

        var list1 = [];
        var list2 = [];
        var list3 = [];
        var list4 = [];
        for (var a of heads) {
            list1.push([a]);
            for (var b of heads) {
                list2.push([a,b]);
                for (var c of heads) {
                    list3.push([a,b,c]);
                    for (var d of heads) {
                        list4.push([a,b,c,d]);
                    }
                }
            }
        }
    }

    testIsDeadEndOrJunctionOrCrossingStreet() {
        assertTrue(this.tile_road[1].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[5].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[9].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[13].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[17].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[21].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[45].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[49].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[53].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[57].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[61].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[65].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[69].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[73].isDeadEndOrJunctionOrCrossing());
        assertTrue(this.tile_road[77].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[81].isDeadEndOrJunctionOrCrossing());
        assertTrue(!this.tile_road[85].isDeadEndOrJunctionOrCrossing());
    }

    testIsDeadEndOrJunctionOrCrossingStraight() {
        this.helperIsDeadEndOrJunctionOrCrossing(this.tile_road[17], [
            {240: [60]},
            {240: [120]},
            {240: [60, 120]},
            {60: [240]},
            {60: [300]},
            {60: [240, 300]},
            {240: [60], 60: [240]},
            {240: [60], 60: [300]},
            {240: [60], 60: [240, 300]},
            {240: [120], 60: [240]},
            {240: [120], 60: [300]},
            {240: [120], 60: [240, 300]},
            {240: [60, 120], 60: [240]},
            {240: [60, 120], 60: [300]},
            {240: [60, 120], 60: [240, 300]}
        ], false);
    }

    testIsDeadEndOrJunctionOrCrossingCurve() {
        this.helperIsDeadEndOrJunctionOrCrossing(this.tile_road[61], [
            {60: [300]},
            {240: [120]},
            {240: [120], 60: [300]},
            {120: [240]},
            {120: [240], 60: [300]},
            {120: [300]},
            {120: [60]},
            {120: [60], 60: [300]},
            {120: [240,300]},
            {120: [240,60]},
            {120: [240,60], 60: [300]},
            {120: [300,60]},
            {120: [240,300,60]},
            {240: [120], 120: [240]},
            {240: [120], 120: [240], 60: [300]},
            {240: [120], 120: [300]},
            {240: [120], 120: [60]},
            {240: [120], 120: [60], 60: [300]},
            {240: [120], 120: [240,300]},
            {240: [120], 120: [240,60]},
            {240: [120], 120: [240,60], 60: [300]},
            {240: [120], 120: [300,60]},
            {240: [120], 120: [240,300,60]}
        ], false);
    }

    testIsDeadEndOrJunctionOrCrossingGrass() {
        this.helperIsDeadEndOrJunctionOrCrossing(this.tile_grass, [
            {60: [120]},
            {60: [120], 120: [60]},
            {60: [120], 120: [60], 300: [240]},
            {60: [120], 300: [240]},
            {60: [240]},
            {60: [240], 240: [60]},
            {60: [240], 240: [120]},
            {60: [240], 240: [60,120]},
            {60: [240], 120: [60]},
            {60: [240], 120: [60], 240: [120]},
            {60: [300]},
            {60: [300], 120: [240]},
            {60: [300], 120: [240], 240: [120]},
            {60: [300], 120: [60,240]},
            {60: [300], 120: [60,240], 240: [120]},
            {60: [300], 300: [60]},
            {60: [300], 300: [120]},
            {60: [300], 300: [240]},
            {60: [300], 300: [60,120]},
            {60: [300], 300: [60,240]},
            {60: [300], 300: [120,240]},
            {60: [300], 240: [60]},
            {60: [300], 240: [120]},
            {60: [300], 240: [60,120]},
            {60: [300], 120: [60]},
            {60: [300], 300: [60], 240: [120]},
            {60: [300], 300: [240], 240: [60]},
            {60: [300], 300: [240], 240: [120]},
            {60: [300], 300: [240], 240: [60,120]},
            {60: [300], 300: [240], 240: [120], 120: [60]},
            {60: [300], 300: [60,240], 240: [120]},
            {60: [300], 300: [60,120,240]},
            {60: [300], 120: [60], 240: [120]},
            {60: [300], 120: [60], 300: [120]},
            {60: [300], 120: [60], 300: [240]},
            {60: [300], 120: [60], 300: [120,240]},
            {60: [120,240]},
            {60: [120,240], 120: [60]},
            {60: [120,300]},
            {60: [120,300], 120: [60]},
            {60: [120,300], 300: [240]},
            {60: [120,300], 120: [60], 300: [240]},
            {60: [240,300]},
            {60: [240,300], 120: [60]},
            {60: [240,300], 240: [60]},
            {60: [240,300], 240: [120]},
            {60: [240,300], 240: [60,120]},
            {60: [240,300], 240: [120], 120: [60]},
            {60: [120,240,300]},
            {60: [120,240,300], 120: [60]}
        ], true);
    }

    testIsDeadEnd() {
        assertTrue(!this.tile_road[1].isDeadEnd());
        assertTrue(!this.tile_road[5].isDeadEnd());
        assertTrue(!this.tile_road[9].isDeadEnd());
        assertTrue(!this.tile_road[13].isDeadEnd());
        assertTrue(!this.tile_road[17].isDeadEnd());
        assertTrue(!this.tile_road[21].isDeadEnd());
        assertTrue(!this.tile_road[45].isDeadEnd());
        assertTrue(!this.tile_road[49].isDeadEnd());
        assertTrue(!this.tile_road[53].isDeadEnd());
        assertTrue(!this.tile_road[57].isDeadEnd());
        assertTrue(!this.tile_road[61].isDeadEnd());
        assertTrue(this.tile_road[65].isDeadEnd());
        assertTrue(this.tile_road[69].isDeadEnd());
        assertTrue(this.tile_road[73].isDeadEnd());
        assertTrue(this.tile_road[77].isDeadEnd());
        assertTrue(!this.tile_road[81].isDeadEnd());
        assertTrue(!this.tile_road[85].isDeadEnd());
    }

    testComputeAllNeighbours() {
        var tile = new Tile('g0000', '0', 0, 0);
        var tile1 = new Tile('g0000', '1', -50, -50);
        var tile2 = new Tile('g0000', '2', -50, 50);
        var tile3 = new Tile('g0000', '3', 50, 50);
        var tile4 = new Tile('g0000', '4', 50, -50);
        var tiles = [tile, tile1, tile2, tile3, tile4];

        tile.computeAllNeighbours(tiles);
        assertTrue(tile.neighbours.length === 4);
        assertTrue(!tile.neighbours.includes(tile));
    }

    testComputeStreetNeighboursAndConnections() {
        var tile = new Tile('r0045', '0', 0, 0);
        var tile1 = new Tile('r0021', '1', -50, -50);
        var tile2 = new Tile('r0081', '2', -50, 50);
        var tile3 = new Tile('r0053', '3', 50, 50);
        var tile4 = new Tile('r0017', '4', 50, -50);
        var tiles = [tile, tile1, tile2, tile3, tile4];
        tile.computeAllNeighbours(tiles);
        tile.computeStreetNeighboursAndConnections();

        assertTrue(tile.streetNeighbours.includes(tile1));
        assertTrue(tile.streetNeighbours.includes(tile2));
        assertTrue(tile.streetNeighbours.includes(tile3));
        assertTrue(tile.streetNeighbours.includes(tile4));
        assertTrue(tile.getNeighbourConnection(tile1) === 300);
        assertTrue(tile.getNeighbourConnection(tile2) === 240);
        assertTrue(tile.getNeighbourConnection(tile3) === 120);
        assertTrue(tile.getNeighbourConnection(tile4) === 60);
    }

    testIsConnectedTo() {
        assertTrue(this.tile_road[45].isConnectedTo(60));
        assertTrue(this.tile_road[45].isConnectedTo(120));
        assertTrue(this.tile_road[45].isConnectedTo(240));
        assertTrue(this.tile_road[45].isConnectedTo(300));
    }

    testGetStreetConnections() {
        assertTrue(this.tile_road[1].getStreetConnections().length === 3);
        assertTrue(this.tile_road[5].getStreetConnections().length === 3);
        assertTrue(this.tile_road[9].getStreetConnections().length === 3);
        assertTrue(this.tile_road[13].getStreetConnections().length === 3);
        assertTrue(this.tile_road[17].getStreetConnections().length === 2);
        assertTrue(this.tile_road[21].getStreetConnections().length === 2);
        assertTrue(this.tile_road[45].getStreetConnections().length === 4);
        assertTrue(this.tile_road[49].getStreetConnections().length === 2);
        assertTrue(this.tile_road[53].getStreetConnections().length === 2);
        assertTrue(this.tile_road[57].getStreetConnections().length === 2);
        assertTrue(this.tile_road[61].getStreetConnections().length === 2);
        assertTrue(this.tile_road[65].getStreetConnections().length === 1);
        assertTrue(this.tile_road[69].getStreetConnections().length === 1);
        assertTrue(this.tile_road[73].getStreetConnections().length === 1);
        assertTrue(this.tile_road[77].getStreetConnections().length === 1);
        assertTrue(this.tile_road[81].getStreetConnections().length === 2);
        assertTrue(this.tile_road[85].getStreetConnections().length === 2);
    }

    testInside() {
        var x = this.tile_grass.x;
        var y = this.tile_grass.y;
        assertTrue(this.tile_grass.inside(x, y));
        assertTrue(this.tile_grass.inside(x+20, y+20, 1));
        assertTrue(!this.tile_grass.inside(x+20, y+20, 0.1));
        assertTrue(!this.tile_grass.inside(x+100, y+100, 1));
    }

    testCenterAhead() {
        var x = this.tile_road[45].x;
        assertTrue(this.tile_road[45].centerAhead(x-10, 90));
        assertTrue(!this.tile_road[45].centerAhead(x+10, 90));
        assertTrue(!this.tile_road[45].centerAhead(x-10, 270));
        assertTrue(this.tile_road[45].centerAhead(x+10, 270));
    }

    testGetLane() {
        var lane = this.tile_road[17].getLane(60, 8);
        assertTrue(lane.px === this.tile_road[17].x);
        assertTrue(lane.py === this.tile_road[17].y + 8);
        assertTrue(Math.abs(lane.nx - 0.5) < 0.001);
        assertTrue(Math.abs(lane.ny - 0.866) < 0.001);
    }

    testGetClosestPointInLane() {
        var x = this.tile_road[45].x;
        var y = this.tile_road[45].y;
        var point = this.tile_road[45].getClosestPointInLane(x, y, 60, 0);
        assertTrue(point.x === x);
        assertTrue(point.y === y);
        var point = this.tile_road[45].getClosestPointInLane(x+5, y+3, 45, 0);
        assertTrue(point.x === x+1);
        assertTrue(point.y === y-1);
        var point = this.tile_road[45].getClosestPointInLane(x-3, y-5, 45, 0);
        assertTrue(point.x === x+1);
        assertTrue(point.y === y-1);
        var point = this.tile_road[45].getClosestPointInLane(x+3, y-3, 45, 0);
        assertTrue(point.x === x+3);
        assertTrue(point.y === y-3);
    }

    testGetDistanceToLane() {
        var x = this.tile_road[45].x;
        var y = this.tile_road[45].y;
        var distance = this.tile_road[45].getDistanceToLane(x, y, 60, 0);
        assertTrue(distance === 0);
        var distance = this.tile_road[45].getDistanceToLane(x+5, y+3, 45, 0);
        assertTrue(distance == Math.sqrt(32));
        var distance = this.tile_road[45].getDistanceToLane(x-3, y-5, 45, 0);
        assertTrue(distance == Math.sqrt(32));
        var distance = this.tile_road[45].getDistanceToLane(x+3, y-3, 45, 0);
        assertTrue(distance === 0);
    }

    testGetLaneTargetPoint() {
        var point1 = this.tile_road[45].getLaneTargetPoint(45, 0, config.Street.lanePointFactor);
        var point2 = this.tile_road[45].getLaneTargetPoint(225, 0, config.Street.lanePointFactor);
        var x1 = 5 * (point1.x-this.tile_road[45].x) / Math.sqrt(2);
        var y1 = 5 * (point1.y-this.tile_road[45].y) / Math.sqrt(2);
        var x2 = 5 * (point2.x-this.tile_road[45].x) / Math.sqrt(2);
        var y2 = 5 * (point2.y-this.tile_road[45].y) / Math.sqrt(2);
        assertTrue(x1 > 0);
        assertTrue(y1 < 0);
        assertTrue(x2 < 0);
        assertTrue(y2 > 0);
        assertTrue(Math.abs(x1 - config.Tile.width/2) < 0.01);
        assertTrue(Math.abs(-y1 - config.Tile.width/2) < 0.01);
        assertTrue(Math.abs(-x2 - config.Tile.width/2) < 0.01);
        assertTrue(Math.abs(y2 - config.Tile.width/2) < 0.01);
    }

    testAddVehicle() {
        this.tile_road[1].addVehicle(this.car1);
        this.tile_road[1].addVehicle(this.car2);
        assertTrue(this.tile_road[1].vehicles.length === 2);
        assertTrue(this.tile_road[1].vehicleHashes.length === 2);
        assertTrue(this.tile_road[1].vehicleHashes[0] === this.car1.hash);
        assertTrue(this.tile_road[1].vehicleHashes[1] === this.car2.hash);
    }

    testGetVehicleIndex() {
        var index = this.tile_road[1].getVehicleIndex(this.car2);
        assertTrue(index === 1);
    }

    testRemoveVehicle() {
        this.tile_road[1].removeVehicle(this.car1);
        assertTrue(this.tile_road[1].vehicles.length === 1);
        assertTrue(this.tile_road[1].vehicleHashes.length === 1);
        assertTrue(this.tile_road[1].vehicleHashes[0] === this.car2.hash);
    }

    testHasFreeParkingLot() {
        assertTrue(!this.tile_road[1].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[5].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[9].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[13].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[17].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[21].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[45].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[49].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[53].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[57].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[61].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[65].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[69].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[73].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[77].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[81].hasFreeParkingLot(0));
        assertTrue(!this.tile_road[85].hasFreeParkingLot(0));

        assertTrue(this.tile_road[17].hasFreeParkingLot(60));
        assertTrue(this.tile_road[21].hasFreeParkingLot(120));
        this.car1.queue = [this.car1.callbackPark];
        this.car1.head = 60;
        this.tile_road[17].vehicles.push(this.car1);
        assertTrue(!this.tile_road[17].hasFreeParkingLot(60));
    }
}
