class TramLineTest {
    constructor() {
        this.tile0 = new Tile('r0045', 0, 0);
        this.tile60 = new Tile('r0017', 50, -50);
        this.tile120 = new Tile('r0053', 50, 50);
        this.tile240 = new Tile('r0081', -50, 50);
        this.tile300 = new Tile('r0021', -50, -50);

        this.tiles = [this.tile0, this.tile60, this.tile120, this.tile240, this.tile300];

        this.tiles.forEach(function(tile, index, tiles) {
            tile.computeAllNeighbours(tiles);
        });
        this.tiles.forEach(function(tile) {
            tile.computeStreetNeighboursAndConnections();
        });

        this.line = new TramLine();
        this.line.abortCalled = false;
        this.line.abort = function() { this.abortCalled = true; };

        this.testIsAllowed();
        this.testGetNextUniqueNeighbour();
        this.testProceed();
    }

    configuration1() {
        this.tile0.tracks.track[240] = [60, 120];
        this.tile0.tracks.track[60] = [240];
        this.tile0.tracks.track[120] = [300];
        this.tile60.tracks.track[240] = [60];
        this.tile60.tracks.track[60] = [240];
        this.tile120.tracks.track[300] = [300];
        this.tile240.tracks.track[240] = [60];
        this.tile300.tracks.track[120] = [300];

        this.tiles.forEach(function(tile) {
            tile.tracks.finalize();
        });
    }

    configuration2() {
        this.tile0.tracks.track[240] = [120];
        this.tile0.tracks.track[300] = [120];
        this.tile0.tracks.track[120] = [300];
        this.tile120.tracks.track[300] = [300];
        this.tile240.tracks.track[240] = [60];
        this.tile300.tracks.track[120] = [120];

        this.tiles.forEach(function(tile) {
            tile.tracks.finalize();
        });
    }

    testIsAllowed() {
        this.configuration1();

        this.line.tiles = [this.tile0];
        assertTrue(this.line.isAllowed(this.tile60));
        assertTrue(!this.line.isAllowed(this.tile120));
        assertTrue(!this.line.isAllowed(this.tile240));
        assertTrue(this.line.isAllowed(this.tile300));

        this.line.tiles = [this.tile60];
        assertTrue(this.line.isAllowed(this.tile0));
        this.line.tiles = [this.tile120];
        assertTrue(!this.line.isAllowed(this.tile0));
        this.line.tiles = [this.tile240];
        assertTrue(this.line.isAllowed(this.tile0));
        this.line.tiles = [this.tile300];
        assertTrue(!this.line.isAllowed(this.tile0));

        this.line.tiles = [this.tile240, this.tile0];
        assertTrue(this.line.isAllowed(this.tile60));
        assertTrue(this.line.isAllowed(this.tile120));
        assertTrue(!this.line.isAllowed(this.tile240));
        assertTrue(!this.line.isAllowed(this.tile300));

        this.line.tiles = [this.tile240, this.tile0, this.tile120];
        assertTrue(this.line.isAllowed(this.tile0));
    }

    testGetNextUniqueNeighbour() {
        this.configuration1();

        this.line.tiles = [this.tile240];
        assertTrue(this.tile0.equals(this.line.getNextUniqueNeighbour()));
        this.line.tiles = [this.tile240, this.tile0];
        assertTrue(this.line.getNextUniqueNeighbour() === this.line.NEIGHBOUR_STATUS.MULTIPLE_PATHS);
        this.line.tiles = [this.tile240, this.tile0, this.tile120];
        assertTrue(this.tile0.equals(this.line.getNextUniqueNeighbour()));
        this.line.tiles = [this.tile240, this.tile0, this.tile120, this.tile0];
        assertTrue(this.tile300.equals(this.line.getNextUniqueNeighbour()));
        this.line.tiles = [this.tile60, this.tile0];
        assertTrue(this.tile240.equals(this.line.getNextUniqueNeighbour()));
        this.line.tiles = [this.tile60, this.tile0, this.tile240];
        assertTrue(this.line.getNextUniqueNeighbour() === this.line.NEIGHBOUR_STATUS.NO_NEIGHBOUR);
        this.line.tiles = [this.tile60];
        assertTrue(this.line.getNextUniqueNeighbour() === this.line.NEIGHBOUR_STATUS.MULTIPLE_PATHS);
        this.line.tiles = [this.tile0, this.tile300];
        assertTrue(this.line.getNextUniqueNeighbour() === null);
    }

    testProceed() {
        this.configuration1();

        this.line.tiles = [];
        this.line.proceed(this.tile0);
        assertTrue(this.line.tiles.length === 1);
        assertTrue(this.line.tiles[0].equals(this.tile0));
        assertTrue(!this.line.closed);

        this.line.abortCalled = false;
        this.line.tiles = [];
        this.line.proceed(this.tile240);
        assertTrue(this.line.tiles.length === 2);
        assertTrue(this.line.tiles[0].equals(this.tile240));
        assertTrue(this.line.tiles[1].equals(this.tile0));
        assertTrue(!this.line.closed);
        this.line.proceed(this.tile120);
        assertTrue(this.line.tiles.length === 5);
        assertTrue(this.line.tiles[0].equals(this.tile240));
        assertTrue(this.line.tiles[1].equals(this.tile0));
        assertTrue(this.line.tiles[2].equals(this.tile120));
        assertTrue(this.line.tiles[3].equals(this.tile0));
        assertTrue(this.line.tiles[4].equals(this.tile300));
        assertTrue(!this.line.closed);
        assertTrue(this.line.abortCalled);

        this.line.abortCalled = false;
        this.line.tiles = [];
        this.line.proceed(this.tile120);
        assertTrue(this.line.tiles.length === 3);
        assertTrue(this.line.tiles[0].equals(this.tile120));
        assertTrue(this.line.tiles[1].equals(this.tile0));
        assertTrue(this.line.tiles[2].equals(this.tile300));
        assertTrue(!this.line.closed);
        assertTrue(this.line.abortCalled);

        this.line.abortCalled = false;
        this.line.tiles = [];
        this.line.proceed(this.tile60);
        assertTrue(this.line.tiles.length === 1);
        assertTrue(this.line.tiles[0].equals(this.tile60));
        this.line.proceed(this.tile0);
        assertTrue(!this.line.closed);
        assertTrue(this.line.abortCalled);

        this.configuration2();

        this.line.abortCalled = false;
        this.line.tiles = [];
        this.line.proceed(this.tile240);
        assertTrue(this.line.tiles.length > config.Tram.maxLineLength);
        assertTrue(!this.line.closed);
        assertTrue(this.line.abortCalled);

        this.line.tiles = [];
        this.line.proceed(this.tile0);
        assertTrue(this.line.tiles.length === 1);
        assertTrue(this.line.tiles[0].equals(this.tile0));
        this.line.proceed(this.tile300);
        assertTrue(this.line.tiles.length === 4);
        assertTrue(this.line.tiles[0].equals(this.tile0));
        assertTrue(this.line.tiles[1].equals(this.tile300));
        assertTrue(this.line.tiles[2].equals(this.tile0));
        assertTrue(this.line.tiles[3].equals(this.tile120));
        assertTrue(this.line.closed);
    }
}
