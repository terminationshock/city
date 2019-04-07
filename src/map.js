class Map {
    constructor() {
        this.tiles = [];
        this.tileRowId = [];
        this.masterGroup = null;
        this.rowGroupsGround = [];
        this.rowGroupsHouses = [];
        this.nCols = 0;
        this.nRows = 0;
        this.trackHashes = [];
        this.trackTiles = [];
        this.counterHashMap = {};
    }

    loadMap(fileContent) {
        var lines = fileContent.trim().split('\n');
        this.masterGroup = game.add.group();

        for (var y = 0; y < lines.length; y++) {
            if (lines[y].includes(',')) {
                var tileCodes = lines[y].split(',');
                this.nRows++;
                this.nCols = Math.max(this.nCols, tileCodes.length);

                var groupGround = game.add.group();
                var groupHouses = game.add.group();
                groupGround.yz = (y-1)*config.Tile.dy;
                groupHouses.yz = (y-1)*config.Tile.dy + config.Tile.height;
                this.rowGroupsGround.push(groupGround);
                this.rowGroupsHouses.push(groupHouses);
                this.masterGroup.add(groupGround);
                this.masterGroup.add(groupHouses);

                var xoff = -config.Tile.dx * (1 - (y % 2));

                for (var x = 0; x < tileCodes.length; x++) {
                    var tileCode = tileCodes[x].trim();
                    if (tileCode.length > 0) {
                        var counter = tileCode.substring(0, 4);
                        var fileId = tileCode.substring(4);
                        var tile = new Tile(fileId, xoff + 2*x*config.Tile.dx, (y-1)*config.Tile.dy);
                        this.counterHashMap[counter] = tile.hash;
                        this.tiles.push(tile);
                        this.tileRowId.push(this.nRows-1);
                    }
                }
            }
        }
    }

    loadTrack(fileContent) {
        this.trackHashes = fileContent.trim().split(',').map(x => this.counterHashMap[x]);
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
        for (var i = 0; i < this.tiles.length; i++) {
            var hasTrack = this.tiles[i].generateTrack(this.trackHashes);
            if (hasTrack) {
                this.trackTiles.push(this.tiles[i]);
            }
        }
    }

    initTrams(trams) {
        for (var i = 0; i < config.Tram.numTrams; i++) {
            var j = Math.floor(this.trackTiles.length/config.Tram.numTrams);
            var tiles = this.trackTiles.slice(i*j, (i+1)*j);
            var tile = tiles[Math.floor(Math.random() * tiles.length)];
            var tram = new Car(tile, trams, config.Tram.numTypes, true);
            tile.addCar(tram);
        }
    }

    draw() {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(this.masterGroup, this.rowGroupsGround[this.tileRowId[i]], this.rowGroupsHouses[this.tileRowId[i]]);
        }
    }

    update() {
        this.tiles.forEach(function (tile) {
            tile.update();
        });
        this.masterGroup.sort('yz');
    }
}


