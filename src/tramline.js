class TramLine {
    constructor(tile) {
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
        var heads = this.tiles[n - 1].getTrackHeadsFrom(headFrom);
        if (heads === null) {
            return false;
        }
        if (!heads.includes(headTo)) {
            return false;
        }
        return true;
    }

    getNextUniqueNeighbour() {
        var n = this.tiles.length;
        var headFrom = null;
        if (n > 1) {
            headFrom = this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]);
        } else {
            var headsFrom = this.tiles[n - 1].tracks.getTrackKeys();
            if (headsFrom.length > 1) {
                return null;
            }
            headFrom = headsFrom[0];
        }

        var heads = this.tiles[n - 1].getTrackHeadsFrom(headFrom);
        if (heads === null) {
            return null;
        }
        if (heads.length > 1) {
            return null;
        }
        return this.tiles[n - 1].getNeighbourAtHead(heads[0]);
    }

    abort() {
        this.tiles.forEach(function(tile) {
            tile.tracks.abort();
        });
        this.tiles = [];
    }

    proceed(tile) {
        if (this.isEmpty()) {
            this.tiles = [tile];
            this.tiles[0].tracks.highlight(null, null);

            var nextTile = this.getNextUniqueNeighbour();
            if (nextTile !== null) {
                this.proceed(nextTile);
            }
            return;
        }

        var n = this.tiles.length;
        this.tiles[n - 1].tracks.abort();
        if (n > 1) {
            this.tiles[n - 1].tracks.highlight(this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]), this.tiles[n - 1].getNeighbourConnection(tile));
        } else {
            this.tiles[n - 1].tracks.highlight(tile.getNeighbourConnection(this.tiles[n - 1]), this.tiles[n - 1].getNeighbourConnection(tile));
        }
        this.tiles.push(tile);

        while(true) {
            var nextTile = this.getNextUniqueNeighbour();
            n = this.tiles.length;
            if (nextTile === null) {
                this.abort();
                break;
            }
            this.tiles[n - 1].tracks.highlight(this.tiles[n - 1].getNeighbourConnection(this.tiles[n - 2]), this.tiles[n - 1].getNeighbourConnection(nextTile));
            if (nextTile.equals(this.tiles[0])) {
                this.closed = true;
                this.abort();
                break;
            }
            this.tiles.push(nextTile);
        }
    }
}
