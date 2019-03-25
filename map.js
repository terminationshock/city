class Map {
    constructor() {
        this.tiles = [];
        this.tileRowId = [];
        this.masterGroup = null;
        this.rowGroups = [];
        this.nCols = 0;
        this.nRows = 0;
    }

    loadMap(fileContent) {
        var lines = fileContent.trim().split('\n');
        this.masterGroup = game.add.group();

        for (var y = 0; y < lines.length; y++) {
            if (lines[y].includes(',')) {
                var fileIds = lines[y].split(',');
                this.nRows++;
                this.nCols = Math.max(this.nCols, fileIds.length);

                var group = game.add.group();
                group.yz = (y-1)*config.Tile.dy + config.Tile.height/2 - config.Car.imgSize*2/3;
                this.rowGroups.push(group);
                this.masterGroup.add(group);

                var xoff = -config.Tile.dx * (1 - (y % 2));

                for (var x = 0; x < fileIds.length; x++) {
                    var fileId = fileIds[x].trim();
                    if (fileId.length > 0) {
                        var tile = new Tile(fileId, xoff + 2*x*config.Tile.dx, (y-1)*config.Tile.dy);
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
        this.tiles.forEach(function (tile, index, tiles) {
            tile.computeStreetNeighbours(tiles);
        });
    }

    draw() {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(this.masterGroup, this.rowGroups[this.tileRowId[i]]);
        }
    }

    update() {
        this.tiles.forEach(function (tile) {
            tile.update();
        });
        this.masterGroup.sort('yz');
    }
}


