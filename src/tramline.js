class TramLine {
    constructor() {
        this.NEIGHBOUR_STATUS = {'MULTIPLE_PATHS': 0, 'NO_NEIGHBOUR': 1};
        this.tiles = [];
        this.closed = false;
    }

    isEmpty() {
        return this.tiles.length === 0;
    }

    isAllowed(tile) {
        if (!tile.hasTracks()) {
            return false;
        }

        var n = this.tiles.length;

        var headFrom = null;
        if (n > 1) {
            headFrom = this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]);
        } else {
            headFrom = tile.getNeighbourConnection(this.tiles[n - 1]);
        }

        var headTo = this.tiles[n - 1].getNeighbourConnection(tile);
        if (headTo === null) {
            return false;
        }
        var heads = this.tiles[n - 1].getTrackHeadsFrom(headFrom);
        if (heads === null) {
            return false;
        }
        if (!heads.includes(headTo)) {
            return false;
        }
        return tile.getTrackHeadsFrom(normalizeAngle(headTo + 180)) !== null;

    }

    getNextUniqueNeighbour() {
        var n = this.tiles.length;
        var headFrom = null;
        if (n > 1) {
            headFrom = this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]);
        } else {
            var headsFrom = this.tiles[n - 1].tracks.getTrackKeys();
            if (headsFrom.length > 1) {
                return this.NEIGHBOUR_STATUS.MULTIPLE_PATHS;
            }
            headFrom = headsFrom[0];
        }

        var heads = this.tiles[n - 1].getTrackHeadsFrom(headFrom);
        if (heads === null) {
            return this.NEIGHBOUR_STATUS.NO_NEIGHBOUR;
        }
        if (heads.length > 1) {
            return this.NEIGHBOUR_STATUS.MULTIPLE_PATHS;
        }
        return this.tiles[n - 1].getNeighbourAtHead(heads[0]);
    }

    getTiles() {
        return this.tiles;
    }

    abort() {
        this.tiles.forEach(tile => tile.abortTrack());
        this.tiles = [];
        this.closed = false;
    }

    proceed(tile) {
        if (this.isEmpty()) {
            this.tiles = [tile];
            this.tiles[0].tracks.highlight(null, null);

            var nextTile = this.getNextUniqueNeighbour();
            if (nextTile !== this.NEIGHBOUR_STATUS.MULTIPLE_PATHS) {
                this.proceed(nextTile);
            }
            return;
        }

        var n = this.tiles.length;
        this.tiles[n - 1].abortTrack();
        if (n > 1) {
            this.tiles[n - 1].tracks.highlight(this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]), this.tiles[n - 1].getNeighbourConnection(tile));
        } else {
            this.tiles[n - 1].tracks.highlight(tile.getNeighbourConnection(this.tiles[n - 1]), this.tiles[n - 1].getNeighbourConnection(tile));
        }
        this.tiles.push(tile);

        while(true) {
            var nextTile1 = this.getNextUniqueNeighbour();
            n = this.tiles.length;
            if (nextTile1 === this.NEIGHBOUR_STATUS.NO_NEIGHBOUR || nextTile1 === null) {
                this.abort();
                break;
            } else if (nextTile1 === this.NEIGHBOUR_STATUS.MULTIPLE_PATHS) {
                if (this.isAllowed(this.tiles[0])) {
                    this.closed = true;
                } else {
                    this.tiles[n - 1].tracks.highlight(this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]), null);
                }
                break;
            }
            this.tiles[n - 1].tracks.highlight(this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]), this.tiles[n - 1].getNeighbourConnection(nextTile1));
            if (nextTile1.equals(this.tiles[1]) && this.tiles[n - 1].equals(this.tiles[0])) {
                this.tiles.pop();
                this.closed = true;
                break;
            }
            if (this.tiles.length > config.Tram.maxLineLength) {
                this.abort();
                break;
            }
            this.tiles.push(nextTile1);
        }
    }

    static show(tiles) {
        for (var i = 0; i < tiles.length; i++) {
            var im1 = i - 1;
            var ip1 = i + 1;
            if (im1 < 0) {
                im1 = tiles.length - 1;
            }
            if (ip1 > tiles.length - 1) {
                ip1 = 0;
            }
            tiles[i].tracks.highlight(tiles[i].getNeighbourConnection(tiles[im1]), tiles[i].getNeighbourConnection(tiles[ip1]));
        }
    }
}
