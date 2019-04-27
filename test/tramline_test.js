class TramLineTest {
    constructor() {
        var tile = new Tile('r0045', 0, 0);
        var tile1 = new Tile('r0021', -20, -20);
        var tile2 = new Tile('r0081', -20, 20);
        var tile3 = new Tile('r0053', 20, 20);
        var tile4 = new Tile('r0017', 20, -20);
        this.tiles = [tile, tile1, tile2, tile3, tile4];

        this.tiles.forEach(function(tile, index, tiles) {
            tile.computeAllNeighbours(tiles);
        });
        this.tiles.forEach(function(tile) {
            tile.computeStreetNeighboursAndConnections();
        });

        this.testIsAllowed();
        this.testGetNextUniqueNeighbour();
        this.testGetTiles();
    }

    testIsAllowed() {
        assertTrue(false);
    }

    testGetNextUniqueNeighbour() {

    }

    testGetTiles() {

    }
}
