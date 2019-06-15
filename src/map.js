class Map {
    constructor() {
        this.tiles = [];
        this.tileRowId = [];
        this.masterGroup = null;
        this.rowGroupsGround = [];
        this.rowGroupsHouses = [];
        this.nCols = 0;
        this.nRows = 0;
        this.newTrack = [];
        this.newLine = new TramLine();
        this.selectedVehicle = null;
        this.tileHover = null;
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
                groupGround.yz = (y - 1) * config.Tile.dy;
                groupHouses.yz = (y - 1) * config.Tile.dy + config.Tile.height;
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
                        var tile = new Tile(fileId, counter, xoff + 2 * x * config.Tile.dx, (y - 1) * config.Tile.dy);
                        this.tiles.push(tile);
                        this.tileRowId.push(this.nRows - 1);
                    }
                }
            }
        }
    }

    loadTracks(fileContent) {
        var lines = fileContent.trim().split('\n');
        for (var y = 0; y < lines.length; y++) {
            if (lines[y].includes(',')) {
                var tileHashes = lines[y].split(',');
                for (var hash of tileHashes) {
                    for (var tile of this.tiles) {
                        if (tile.equalsHash(hash)) {
                            tile.generateTrack(tileHashes);
                            tile.finalizeTrack();
                        }
                    }
                }
            }
        }
    }

    loadStops(fileContent) {
        var line = fileContent.trim();
        if (line.includes(',')) {
            var tileHashes = line.split(',');
            for (var hash of tileHashes) {
                for (var tile of this.tiles) {
                    if (tile.equalsHash(hash)) {
                        tile.addStop();
                    }
                }
            }
        }
    }

    loadTrams(fileContent, tramImages) {
        var lines = fileContent.trim().split('\n');
        for (var y = 0; y < lines.length; y++) {
            if (lines[y].includes(',')) {
                var tileHashes = lines[y].split(',');
                var tiles = [];
                for (var hash of tileHashes) {
                    for (var tile of this.tiles) {
                        if (tile.equalsHash(hash)) {
                            tiles.push(tile);
                        }
                    }
                }
                if (tiles.length > 1) {
                    var numTrams = Math.ceil(tiles.length / config.Tram.maxTilesPerTram);
                    var permutations = getPermutations(tiles, numTrams);
                    permutations.forEach(function(tileList) {
                        tileList[0].addVehicle(new Tram(tileList[0], tileList[0].getNeighbourConnection(tileList[1]), tramImages, config.Tram.numTypes, tileList));
                    });
                }
            }
        }
    }

    getWidth() {
        return 2 * this.nCols * config.Tile.dx - Math.floor(config.Tile.width / 2);
    }

    getHeight(fileContent) {
        return this.nRows * config.Tile.dy - Math.floor(config.Tile.height / 2);
    }

    initTiles() {
        this.tiles.forEach(function(tile, index, tiles) {
            tile.computeAllNeighbours(tiles);
        });
        this.tiles.forEach(function(tile) {
            tile.computeStreetNeighboursAndConnections();
            tile.computeLineSegments();
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
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw(this.rowGroupsGround[this.tileRowId[i]], this.rowGroupsHouses[this.tileRowId[i]]);
        }
        this.drawVehicles();
        this.drawTracks();
    }

    drawTracks() {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].drawTracks(this.rowGroupsGround[this.tileRowId[i]]);
        }
        this.drawStops();
    }

    drawVehicles() {
        for (var tile of this.tiles) {
            tile.drawVehicles(this.masterGroup, disableUI);
        }
    }

    drawStops() {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].drawStop(this.rowGroupsGround[this.tileRowId[i]]);
        }
    }

    update() {
        this.tiles.forEach(tile => tile.update());
        this.masterGroup.sort('yz');
    }

    disableTileHover() {
        if (this.tileHover !== null) {
            this.tileHover.setHover(false);
        }
    }

    newTrackClick(x, y, hover) {
        for (var tile of this.tiles) {
            if (tile.inside(x, y)) {
                this.disableTileHover();
                if (!tile.isHouse() && (this.newTrack.length === 0 || this.newTrack[this.newTrack.length - 1].isTrackNeighbourOf(tile))) {
                    if (hover) {
                        this.tileHover = tile;
                        this.tileHover.setHover(true);
                        return true;
                    }

                    this.newTrack.push(tile);
                    var newTrackHashes = this.newTrack.map(x => x.hash);

                    tile.generateTrack(newTrackHashes);
                    if (this.newTrack.length > 1) {
                        this.newTrack[0].generateTrack(newTrackHashes);
                        this.newTrack[this.newTrack.length - 2].generateTrack(newTrackHashes);
                    }
                    this.drawTracks();
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    newStopClick(x, y, hover) {
        for (var tile of this.tiles) {
            if (tile.inside(x, y)) {
                this.disableTileHover();
                if (tile.hasTracks() && tile.isStraightTrack() && (tile.isStraight() || tile.isGrass()) && !tile.hasStop()) {
                    if (hover) {
                        this.tileHover = tile;
                        this.tileHover.setHover(true);
                        return true;
                    }

                    tile.addStop();
                    console.log(tile.hash);
                    this.drawStops();
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    newTramClick(x, y, hover, tramImages) {
        for (var tile of this.tiles) {
            if (tile.inside(x, y)) {
                this.disableTileHover();
                if (tile.hasTracks() && ((this.newLine.isEmpty() && tile.isStraightTrack()) || (!this.newLine.isEmpty() && this.newLine.isAllowed(tile)))) {
                    if (hover) {
                        this.tileHover = tile;
                        this.tileHover.setHover(true);
                        return true;
                    }

                    this.newLine.proceed(tile);
                    this.drawTracks();

                    if (this.newLine.closed) {
                        this.newTramFinalize(tramImages);
                    }
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    showTramClick(x, y) {
        this.tiles.forEach(t => t.abortTrack());
        var clicked = false;
        this.selectedVehicle = null;

        for (var tile of this.tiles) {
            var vehicle = tile.clickVehicle(x, y);
            if (vehicle !== null) {
                this.selectedVehicle = vehicle;
                clicked = true;
            }
        }
        this.drawTracks();
        return clicked;
    }

    newTrackAbort() {
        if (this.newTrack.length > 0) {
            this.newTrack.forEach(tile => tile.abortTrack());
            this.drawTracks();
            this.newTrack = [];
        }
        this.disableTileHover();
    }

    newTramAbort() {
        if (this.newLine !== null) {
            this.newLine.abort();
            this.drawTracks();
        }
        this.disableTileHover();
    }

    newTrackFinalize() {
        if (this.newTrack.length < 2) {
            this.newTrackAbort();
            return;
        }

        if (this.newTrack.length > 0) {
            console.log(this.newTrack.map(x => x.hash).join());
            this.newTrack.forEach(tile => tile.finalizeTrack());
            this.drawTracks();
            this.newTrack = [];
        }
        this.disableTileHover();
    }

    newTramFinalize(tramImages) {
        if (this.newLine !== null) {
            var tiles = this.newLine.getTiles();
            console.log(tiles.map(x => x.hash).join());
            tiles[0].addVehicle(new Tram(tiles[0], tiles[0].getNeighbourConnection(tiles[1]), tramImages, config.Tram.numTypes, tiles));
            this.drawVehicles();
            this.newTramAbort();
        }
    }

    removeSelectedTram() {
        if (this.selectedVehicle !== null) {
            this.selectedVehicle.disable();
            this.selectedVehicle = null;
            this.showTramClick(-1, -1);
        }
    }
};
