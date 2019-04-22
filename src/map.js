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
                        var tile = new Tile(fileId, xoff + 2 * x * config.Tile.dx, (y - 1) * config.Tile.dy);
                        this.counterHashMap[counter] = tile.hash;
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

    getHeight(fileContent) {
        return this.nRows * config.Tile.dy - Math.floor(config.Tile.height / 2);
    }

    initTiles(houseImages, treeImages, carImages) {
        this.tiles.forEach(function(tile, index, tiles) {
            tile.computeAllNeighbours(tiles);
        });
        this.tiles.forEach(function(tile) {
            tile.computeStreetNeighboursAndConnections();
            tile.computeLineSegments();
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
    }

    drawTracks() {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].drawTracks(this.rowGroupsGround[this.tileRowId[i]]);
        }
    }

    drawVehicles() {
        for (var tile of this.tiles) {
            tile.drawVehicles(this.masterGroup);
        }
    }

    drawStops() {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].drawStop(this.rowGroupsGround[this.tileRowId[i]]);
        }
    }

    update() {
        this.tiles.forEach(function(tile) {
            tile.update();
        });
        this.masterGroup.sort('yz');
    }

    newTrackClick(x, y, hover) {
        for (var tile of this.tiles) {
            if (tile.inside(x, y) && !tile.isHouse()) {
                if (this.newTrack.length === 0 || this.newTrack[this.newTrack.length - 1].isTrackNeighbourOf(tile)) {
                    if (hover) {
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
            }
        }
        return false;
    }

    newStopClick(x, y, hover) {
        for (var tile of this.tiles) {
            if (tile.inside(x, y) && tile.hasTracks() && tile.isStraightTrack() && (tile.isStraight() || tile.isGrass()) && !tile.hasStop()) {
                if (hover) {
                    return true;
                }

                tile.addStop();
                tile.drawStops();
            }
        }
        return false;
    }

    newTramClick(x, y, hover, tramImages) {
        for (var tile of this.tiles) {
            if (tile.inside(x, y) && tile.hasTracks() && tile.isStraightTrack() && !tile.hasDrivingVehicles()) {
                if (hover) {
                    return true;
                }

                var head = tile.tracks.getRandomConnection();
                tile.addVehicle(new Tram(tile, head, tramImages, config.Tram.numTypes));
                this.drawVehicles();
            }
        }
        return false;
    }

    newTrackAbort() {
        if (this.newTrack.length > 0) {
            this.newTrack.forEach(function(tile) {
                tile.generateTrack([]);
            });
            this.drawTracks();
            this.newTrack = [];
        }
    }

    newTrackFinalize() {
        if (this.newTrack.length < 2) {
            this.newTrackAbort();
            return;
        }

        if (this.newTrack.length > 0) {
            this.newTrack.forEach(function(tile) {
                tile.finalizeTrack();
            });
            this.drawTracks();
            this.newTrack = [];
        }
    }
};
