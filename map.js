class Map {
    constructor() {
        this.tiles = [];
        this.tileRowId = [];
        this.groups = [];
        this.nCols = 0;
        this.nRows = 0;
    }

    loadMap(game, fileContent) {
        var lines = fileContent.trim().split('\n');

        for (var y = 0; y < lines.length; y++) {
            if (lines[y].indexOf(',') >= 0) {
                var fileIds = lines[y].split(',');
                this.nRows++;
                this.nCols = Math.max(this.nCols, fileIds.length);

                var group = game.add.group();
                this.groups.push(group);

                var xoff = -config.Tile.dx * (1 - (y % 2));

                for (var x = 0; x < fileIds.length; x++) {
                    var fileId = fileIds[x].trim();
                    if (fileId.length > 0) {
                        var tile = new Tile(game, fileId, xoff + 2*x*config.Tile.dx, (y-1)*config.Tile.dy);
                        this.tiles.push(tile);
                        this.tileRowId.push(this.nRows-1);
                    }
                }
            }
        }
    }

    getWidth() {
        return 2*this.nCols*config.Tile.dx - Math.floor(config.Tile.width/2);
    }

    getHeight(fileContent) {
        return this.nRows*config.Tile.dy - Math.floor(config.Tile.height/2);
    }

    initTiles(houseImages, treeImages, carImages) {
        this.tiles.forEach(function (tile, index, tiles) {
            tile.computeAllNeighbours(tiles);
            tile.computeStreetConnections();
            tile.generateHouse(houseImages);
            tile.generateTrees(treeImages);
            tile.generateCars(carImages);
        });
    }

    draw(game) {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(game, this.groups[this.tileRowId[i]]);
        }
    }
}


