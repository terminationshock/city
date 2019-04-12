class Tracks {
    constructor(tile) {
        this.tile = tile;
        this.track = {};
        this.newTrack = {};
        this.trackPoints = null;
    }

    generate(track) {
        if (!this.tile.isStreet()) {
            return;
        }

        this.newTrack = {};

        if (track.length === 1 && track[0] === this.tile.hash) {
            this.newTrack[60] = [240];
            this.newTrack[120] = [300];
            this.newTrack[240] = [60];
            this.newTrack[300] = [120];
            return;
        }

        var indices = [];
        var index = track.indexOf(this.tile.hash);
        while (index != -1) {
            indices.push(index);
            index = track.indexOf(this.tile.hash, index + 1);
        }

        for (var i = 0; i < indices.length; i++) {
            var indexNext = indices[i] + 1;
            var indexPrev = indices[i] - 1;
            if (indexNext === track.length) {
                indexNext = 0;
            }
            if (indexPrev === -1) {
                indexPrev = track.length - 1;
            }

            var negativeHeadFrom = null;
            var headTo = null;
            if (track[indexPrev] in this.tile.neighbourConnections && track[indexNext] in this.tile.neighbourConnections) {
                negativeHeadFrom = this.tile.neighbourConnections[track[indexPrev]];
                headTo = this.tile.neighbourConnections[track[indexNext]];
            } else if (track[indexPrev] in this.tile.neighbourConnections) {
                negativeHeadFrom = this.tile.neighbourConnections[track[indexPrev]];
                headTo = negativeHeadFrom + 180;
                if (headTo >= 360) {
                    headTo -= 360;
                }
            } else if (track[indexNext] in this.tile.neighbourConnections) {
                headTo = this.tile.neighbourConnections[track[indexNext]];
                negativeHeadFrom = headTo + 180;
                if (negativeHeadFrom >= 360) {
                    negativeHeadFrom -= 360;
                }
            }

            if (headTo !== null) {
                if (negativeHeadFrom in this.newTrack) {
                    this.newTrack[negativeHeadFrom].push(headTo);
                } else {
                    this.newTrack[negativeHeadFrom] = [headTo];
                }
            }
        }
    }

    finalize() {
        for (var head in this.newTrack) {
            if (head in this.track) {
                for (var i = 0; i < this.newTrack[head].length; i++) {
                    this.track[head].push(this.newTrack[head][i]);
                }
            } else {
                this.track[head] = this.newTrack[head];
            }
        }
        for (var headFrom in this.track) {
            var headsTo = [];
            for (var i = 0; i < this.track[headFrom].length; i++) {
                if (!headsTo.includes(this.track[headFrom][i])) {
                    headsTo.push(this.track[headFrom][i]);
                }
            }
            this.track[headFrom] = headsTo;
        }
        this.newTrack = {};
    }

    addSingleTrack(negativeHeadFrom, headTo) {
         var headFrom = convertInt(negativeHeadFrom) + 180;
         if (headFrom >= 360) {
             headFrom -= 360;
         }

         for (var j = -1; j <= 1; j += 2) {
             var p1 = this.tile.getLaneStartPoint(headFrom, config.Street.laneDrive + j*config.Track.width/2, config.Track.lanePointFactor);
             var p2 = this.tile.getLaneTargetPoint(headTo, config.Street.laneDrive + j*config.Track.width/2, config.Track.lanePointFactor);

             if (headFrom === headTo) {
                 this.trackPoints.moveTo(p1.x, p1.y);
                 this.trackPoints.lineTo(p2.x, p2.y);
             } else {
                 var curve = this.tile.getCurve(p1, p2, headFrom, headTo, config.Track.bezierFactor);
                 var path = curve.getPath(config.Track.curveFactor);

                 this.trackPoints.moveTo(p1.x, p1.y);
                 this.trackPoints.lineTo(path[0].x, path[0].y);
                 for (var i = 1; i < path.length; i++) {
                     this.trackPoints.lineTo(path[i].x, path[i].y);
                 }
                 this.trackPoints.lineTo(p2.x, p2.y);
             }
         }
    }

    getRandomConnection() {
        var connections = Object.keys(this.track);
        return this.track[connections[Math.floor(Math.random() * connections.length)]];
    }

    hasTracks() {
        return Object.keys(this.track).length > 0;
    }

    getHeadFrom(head) {
        return this.track[head];
    }

    draw(group) {
        if (this.trackPoints !== null) {
            this.trackPoints.destroy();
        }

        if (this.hasTracks() || Object.keys(this.newTrack).length > 0) {
            this.trackPoints = new Phaser.Graphics(game, 0, 0);

            this.trackPoints.lineStyle(1, Phaser.Color.hexToRGB(config.Track.color), 1);
            for (var headFrom in this.track) {
                var headsTo = this.track[headFrom];
                for (var i = 0; i < headsTo.length; i++) {
                    this.addSingleTrack(headFrom, headsTo[i]);
                }
            }
            this.trackPoints.lineStyle(1, Phaser.Color.hexToRGB(config.Track.activeColor), 1);
            for (var headFrom in this.newTrack) {
                var headsTo = this.newTrack[headFrom];
                for (var i = 0; i < headsTo.length; i++) {
                    this.addSingleTrack(headFrom, headsTo[i]);
                }
            }

            group.add(this.trackPoints);
        }
    }
}
