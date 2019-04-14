class TracksTest {
    constructor() {
        var tile = new Tile('r0045', 0, 0);
        var tile1 = new Tile('r0021', -20, -20);
        var tile2 = new Tile('r0081', -20, 20);
        var tile3 = new Tile('r0053', 20, 20);
        var tile4 = new Tile('r0017', 20, -20);
        this.tiles = [tile, tile1, tile2, tile3, tile4];
        tile.computeAllNeighbours(this.tiles);
        tile.computeStreetNeighboursAndConnections();
        this.tracks = new Tracks(tile);

        this.testHasTracks();
        this.testIsStraight();
        this.testIsCurve();
        this.testGenerateTrack();
    }

    testHasTracks() {
        this.tracks.track[60] = 240;
        this.tracks.finalize();
        var res = this.tracks.hasTracks();
        console.assert(res);
    }

    testIsStraight() {
        this.tracks.track = {};
        this.tracks.track[240] = [60];
        this.tracks.finalize();
        console.assert(this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [240];
        this.tracks.finalize();
        console.assert(!this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [60,120];
        this.tracks.finalize();
        console.assert(!this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [60];
        this.tracks.track[60] = [240];
        this.tracks.finalize();
        console.assert(this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [60];
        this.tracks.track[60] = [300];
        this.tracks.finalize();
        console.assert(!this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [60];
        this.tracks.track[300] = [60];
        this.tracks.finalize();
        console.assert(!this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [60];
        this.tracks.track[300] = [120];
        this.tracks.finalize();
        console.assert(!this.tracks.isStraight());
        this.tracks.track = {};
        this.tracks.track[240] = [60];
        this.tracks.track[300] = [120];
        this.tracks.track[120] = [300];
        this.tracks.finalize();
        console.assert(!this.tracks.isStraight());
    }

    testIsCurve() {
        this.tracks.track = {};
        this.tracks.track[240] = [300];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[240] = [300];
        this.tracks.track[300] = [240];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[240] = [120];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[240] = [120];
        this.tracks.track[120] = [240];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[300] = [60];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[60] = [300];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[300] = [60];
        this.tracks.track[60] = [300];
        this.tracks.finalize();
        console.assert(this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[60] = [60];
        this.tracks.finalize();
        console.assert(!this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[300] = [60];
        this.tracks.track[60] = [120];
        this.tracks.finalize();
        console.assert(!this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[300] = [60];
        this.tracks.track[60] = [240];
        this.tracks.finalize();
        console.assert(!this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[300] = [60,120];
        this.tracks.finalize();
        console.assert(!this.tracks.isCurve());
        this.tracks.track = {};
        this.tracks.track[300] = [60,120];
        this.tracks.track[60] = [300];
        this.tracks.finalize();
        console.assert(!this.tracks.isCurve());
    }

    testGenerateTrack() {
        this.tracks.generate([this.tiles[0].hash]);
        console.assert(this.tracks.newTrack[60][0] === 240);
        console.assert(this.tracks.newTrack[120][0] === 300);
        console.assert(this.tracks.newTrack[240][0] === 60);
        console.assert(this.tracks.newTrack[300][0] === 120);

        this.tracks.generate([]);
        console.assert(Object.keys(this.tracks.newTrack).length === 0);

        this.tracks.generate([this.tiles[4].hash, this.tiles[0].hash, this.tiles[1].hash]);
        console.assert(Object.keys(this.tracks.newTrack).length === 1);
        console.assert(this.tracks.newTrack[60].length === 1);
        console.assert(this.tracks.newTrack[60][0] === 300);

        this.tracks.generate([this.tiles[1].hash, this.tiles[0].hash, this.tiles[4].hash]);
        console.assert(Object.keys(this.tracks.newTrack).length === 1);
        console.assert(this.tracks.newTrack[300].length === 1);
        console.assert(this.tracks.newTrack[300][0] === 60);

        this.tracks.generate([this.tiles[4].hash, this.tiles[0].hash, this.tiles[1].hash, this.tiles[4].hash, this.tiles[0].hash, this.tiles[3].hash]);
        console.assert(Object.keys(this.tracks.newTrack).length === 1);
        console.assert(this.tracks.newTrack[60].length === 2);
        console.assert(this.tracks.newTrack[60][0] === 300);
        console.assert(this.tracks.newTrack[60][1] === 120);

        this.tracks.generate([this.tiles[4].hash, this.tiles[0].hash, this.tiles[1].hash, this.tiles[1].hash, this.tiles[0].hash, this.tiles[3].hash]);
        console.assert(Object.keys(this.tracks.newTrack).length === 2);
        console.assert(this.tracks.newTrack[60].length === 1);
        console.assert(this.tracks.newTrack[60][0] === 300);
        console.assert(this.tracks.newTrack[300].length === 1);
        console.assert(this.tracks.newTrack[300][0] === 120);
    }
}
