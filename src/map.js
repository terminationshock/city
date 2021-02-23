class Map {
    constructor() {
        this.tiles = [];
        this.tileRowId = [];
        this.masterGroup = null;
        this.backgroundGroup = null;
        this.foregroundGroup = null;
        this.rowGroupsGround = [];
        this.rowGroupsHouses = [];
        this.nCols = 0;
        this.nRows = 0;
        this.tileHover = null;
    }

    loadMap(fileContent) {
        var lines = fileContent.trim().split('\n');
        this.masterGroup = game.add.group();
        this.backgroundGroup = game.add.group();
        this.foregroundGroup = game.add.group();
        this.masterGroup.add(this.backgroundGroup);
        this.masterGroup.add(this.foregroundGroup);

        var linesLength = lines.length;
        for (var y = 0; y < linesLength; y++) {
            if (lines[y].includes(',')) {
                var tileCodes = lines[y].split(',');
                this.nRows++;
                this.nCols = Math.max(this.nCols, tileCodes.length);

                var groupGround = game.add.group();
                var groupHouses = game.add.group();
                groupGround.yz = (y - 1) * config.Tile.dy;
                groupHouses.yz = (y - 1) * config.Tile.dy + config.Tile.height;
                this.rowGroupsGround.push(groupGround);
                this.rowGroupsHouses.push(groupHouses);
                this.backgroundGroup.add(groupGround);
                this.foregroundGroup.add(groupHouses);

                var xoff = -config.Tile.dx * (1 - (y % 2));

                var tileCodesLength = tileCodes.length;
                for (var x = 0; x < tileCodesLength; x++) {
                    var tileCode = tileCodes[x].trim();
                    if (tileCode.length > 0) {
                        var counter = tileCode.substring(0, 4);
                        var fileId = tileCode.substring(4);
                        var tile = new Tile(fileId, counter, xoff + 2 * x * config.Tile.dx, (y - 1) * config.Tile.dy);
                        this.tiles.push(tile);
                        this.tileRowId.push(this.nRows - 1);
                    }
                }
            }
        }
    }

    getWidth() {
        return 2 * this.nCols * config.Tile.dx - Math.floor(config.Tile.width / 2);
    }

    getHeight() {
        return this.nRows * config.Tile.dy - Math.floor(config.Tile.height / 2);
    }

    initTiles() {
        this.tiles.forEach(function(tile, index, tiles) {
            tile.computeAllNeighbours(tiles);
        });
        this.tiles.forEach(function(tile) {
            tile.computeStreetNeighboursAndConnections();
        });
    }

    generateItems(houseImages, treeImages, carImages) {
        this.tiles.forEach(function(tile) {
            tile.generateHouse(houseImages);
            tile.generateTrees(treeImages);
            tile.generateCars(carImages);
        });
    }

    draw() {
        var tilesLength = this.tiles.length;
        for (var i = 0; i < tilesLength; i++) {
            this.tiles[i].draw(this.rowGroupsGround[this.tileRowId[i]], this.rowGroupsHouses[this.tileRowId[i]]);
        }
        this.drawVehicles();
        this.masterGroup.sort('yz')
    }

    drawVehicles() {
        for (var tile of this.tiles) {
            tile.drawVehicles(this.foregroundGroup);
        }
    }

    update() {
        this.tiles.forEach(tile => tile.update());
        this.foregroundGroup.sort('yz');
    }
};
