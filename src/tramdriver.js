class TramDriver extends Driver {
    constructor(tiles) {
        super();
        this.tiles = tiles;
        this.line = tiles.map(x => x.hash);
        this.lastLineIndex = 0;
        this.waitingTime = 0;
    }

    leaveStop() {
        this.waitingTime += 1;
        if (this.waitingTime > config.Driver.waitAtStop) {
            this.waitingTime = 0;
            return true;
        }
        return false;
    }

    decideTurn(tile) {
        var i = this.line.indexOf(tile.hash, this.lastLineIndex);
        if (i < 0) {
            i = this.line.indexOf(tile.hash);
            if (i < 0) {
                return null;
            }
        }
        i += 1;
        if (i > this.line.length - 1) {
            i = 0;
        }
        this.lastLineIndex = i;
        return tile.getNeighbourConnection(this.line[i]);
    }

    getLine() {
        return this.tiles;
    }
};
