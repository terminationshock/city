class Tracks {
    constructor(tile) {
        this.tile = tile;
        this.track = {};
        this.newTrack = {};
        this.trackPoints = null;
        this.headsFrom = [];
        this.headsTo = [];
        this.lineSegments = [];
    }

    generate(track) {
        if (this.tile.isHouse()) {
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

        for (index of indices) {
            var indexNext = index + 1;
            var indexPrev = index - 1;
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
                headTo = normalizeAngle(negativeHeadFrom + 180);
            } else if (track[indexNext] in this.tile.neighbourConnections) {
                headTo = this.tile.neighbourConnections[track[indexNext]];
                negativeHeadFrom = normalizeAngle(headTo + 180);
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
        var i = null;
        for (var head in this.newTrack) {
            if (head in this.track) {
                for (i = 0; i < this.newTrack[head].length; i++) {
                    this.track[head].push(this.newTrack[head][i]);
                }
            } else {
                this.track[head] = this.newTrack[head];
            }
        }
        for (var headFrom in this.track) {
            var headsTo = [];
            for (i = 0; i < this.track[headFrom].length; i++) {
                if (!headsTo.includes(this.track[headFrom][i])) {
                    headsTo.push(this.track[headFrom][i]);
                }
            }
            this.track[headFrom] = headsTo;
        }
        this.headsFrom = Object.keys(this.track);
        this.headsTo = Object.values(this.track);
        this.newTrack = {};

        this.lineSegments = [];
        for (var negativeHeadFrom in this.track) {
            var headFrom = normalizeAngle(convertInt(negativeHeadFrom) + 180);
            for (var headTo of this.track[negativeHeadFrom]) {
                var p1 = this.tile.getLaneStartPoint(headFrom, config.Street.laneDrive, 1);
                var p2 = this.tile.getLaneTargetPoint(headTo, config.Street.laneDrive, 0.24);
                var segments = [];
                if (getTurnDirection(headFrom, headTo) === -1) {
                    segments.push(new Phaser.Line(Math.round(p1.x), Math.round(p1.y), Math.round(this.tile.x), Math.round(this.tile.y)));
                    segments.push(new Phaser.Line(Math.round(this.tile.x), Math.round(this.tile.y), Math.round(p2.x), Math.round(p2.y)));
                } else {
                    segments.push(new Phaser.Line(Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y)));
                }
                this.lineSegments.push(segments);
            }
        }
    }

    abort() {
        this.generate([]);
    }

    addSingleTrack(negativeHeadFrom, headTo) {
         var headFrom = normalizeAngle(convertInt(negativeHeadFrom) + 180);

         for (var j = -1; j <= 1; j += 2) {
             var p1 = this.tile.getLaneStartPoint(headFrom, config.Street.laneDrive + j * config.Track.width / 2, 1);
             var pc1 = this.tile.getLaneStartPoint(headFrom, config.Street.laneDrive + j * config.Track.width / 2, config.Track.lanePointFactor);
             var pc2 = this.tile.getLaneTargetPoint(headTo, config.Street.laneDrive + j * config.Track.width / 2, config.Track.lanePointFactor);
             var p2 = this.tile.getLaneTargetPoint(headTo, config.Street.laneDrive + j * config.Track.width / 2, 1);

             if (headFrom === headTo) {
                 this.trackPoints.moveTo(p1.x, p1.y);
                 this.trackPoints.lineTo(p2.x, p2.y);
             } else {
                 var path = getCurve(pc1, pc2, headFrom, headTo, config.Track.bezierFactor).getPath(config.Track.curveFactor);

                 this.trackPoints.moveTo(p1.x, p1.y);
                 this.trackPoints.lineTo(path[0].x, path[0].y);
                 for (var point of path) {
                     this.trackPoints.lineTo(point.x, point.y);
                 }
                 this.trackPoints.lineTo(p2.x, p2.y);
             }
         }
    }

    getRandomConnection() {
        return this.headsTo[Math.floor(Math.random() * this.headsTo.length)];
    }

    hasTracks() {
        return this.headsFrom.length > 0;
    }

    getTrackKeys() {
        return Object.keys(this.track);
    }

    getLineSegments() {
        return this.lineSegments;
    }

    isNotIntersecting() {
        if (this.isDeadEnd()) {
            return false;
        }
        if (this.tile.linesIntersectInside(this.lineSegments)) {
            return false;
        }
        return true;
    }

    isDeadEnd() {
        for (var negativeHeadFrom in this.track) {
            for (var headTo of this.track[negativeHeadFrom]) {
                if (headTo === convertInt(negativeHeadFrom)) {
                    return true;
                }
            }
        }
        return false;
    }

    isStraight() {
        var keys = this.headsFrom.map(x => convertInt(x));
        if (keys.length > 2) {
            return false;
        }
        for (var negativeHeadFrom in this.track) {
            if (this.track[negativeHeadFrom].length > 1) {
                return false;
            }
            if (normalizeAngle(convertInt(negativeHeadFrom) + 180) !== convertInt(this.track[negativeHeadFrom])) {
                return false;
            }
            if (keys.length === 2 && !keys.includes(this.track[negativeHeadFrom][0])) {
                return false;
            }
        }
        return true;
    }

    getStraights() {
        if (this.isStraight()) {
            return Object.keys(this.track).map(x => normalizeAngle(convertInt(x) + 180));
        }
        return null;
    }

    getHeadsFrom(head) {
        if (head in this.track) {
            return this.track[head];
        }
        return null;
    }

    draw(group) {
        if (this.trackPoints !== null) {
            group.removeChild(this.trackPoints);
            this.trackPoints.destroy();
        }

        if (this.hasTracks() || Object.keys(this.newTrack).length > 0) {
            this.trackPoints = new Phaser.Graphics(game, 0, 0);

            var headFrom = null;
            var headTo = null;
            var headsTo = null;
            this.trackPoints.lineStyle(1, Phaser.Color.hexToRGB(config.Track.color), 1);
            for (headFrom in this.track) {
                headsTo = this.track[headFrom];
                for (headTo of headsTo) {
                    this.addSingleTrack(headFrom, headTo);
                }
            }
            this.trackPoints.lineStyle(1, Phaser.Color.hexToRGB(config.Track.activeColor), 1);
            for (headFrom in this.newTrack) {
                headsTo = this.newTrack[headFrom];
                for (headTo of headsTo) {
                    this.addSingleTrack(headFrom, headTo);
                }
            }

            group.add(this.trackPoints);
        }
    }

    highlight(headFrom, headTo) {
        if (headFrom === null && headTo === null) {
            for (var head in this.track) {
                this.newTrack[head] = this.track[head].slice(0);
            }
        } else if (headTo === null) {
            this.newTrack[headFrom] = this.track[headFrom].slice(0);
        } else {
            this.newTrack[headFrom] = [headTo];
        }
    }
};
