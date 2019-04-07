var game = new Phaser.Game('100', '100', Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update });
var loader = new Loader();
var map = new Map();
var config;
var cursors;
var newTrackMode = false;
var newStopMode = false;
var mouseDown = false;

function loadConfig(progress, key, success, totalLoadedFile, totalFiles) {
    if (key === 'config') {
        config = game.cache.getJSON('config');
        loader.load();
    }
}

function step() {
    map.update();
}

function preload() {
    game.load.onFileComplete.add(loadConfig, this);
    game.load.text('world', 'world.dat');
    game.load.json('config', 'config.json');
}

function create() {
    cursors = game.input.keyboard.createCursorKeys();

    game.stage.backgroundColor = config.Street.color;
    map.loadMap(game.cache.getText('world'));
    map.initTiles(loader.houses, loader.trees, loader.cars);

    game.world.resize(map.getWidth(), map.getHeight());
    map.draw();

    var dt = 1.0 / config.World.stepsPerSecond;
    game.time.events.loop(dt, step);

    document.getElementById('button-track').addEventListener('click', onButtonTrack);
    document.getElementById('button-stop').addEventListener('click', onButtonStop);
}

function update() {
    if (cursors.up.isDown) {
        game.camera.y -= 20;
    } else if (cursors.down.isDown) {
        game.camera.y += 20;
    }

    if (cursors.left.isDown) {
        game.camera.x -= 20;
    } else if (cursors.right.isDown) {
        game.camera.x += 20;
    }

    if (newTrackMode) {
        if (game.input.mousePointer.leftButton.isDown) {
            mouseDown = true;
        }
        if (game.input.mousePointer.leftButton.isUp && mouseDown) {
            mouseDown = false;
            map.newTrackClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false);
            var closedTrack = map.trackClosed();
            if (closedTrack) {
                document.getElementById('button-track').classList.remove('button-abort');
                document.getElementById('button-track').classList.add('button-finish');
            } else {
                document.getElementById('button-track').classList.add('button-abort');
                document.getElementById('button-track').classList.remove('button-finish');
            }
        } else {
            var ok = map.newTrackClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true);
            if (ok) {
                document.getElementById('canvas').classList.remove('nok');
            } else {
                document.getElementById('canvas').classList.add('nok');
            }
        }
    }

    if (newStopMode) {
        if (game.input.mousePointer.leftButton.isDown) {
            mouseDown = true;
        }
        if (game.input.mousePointer.leftButton.isUp && mouseDown) {
            mouseDown = false;
            map.newStopClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false);
        } else {
            var ok = map.newStopClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true);
            if (ok) {
                document.getElementById('canvas').classList.remove('nok');
            } else {
                document.getElementById('canvas').classList.add('nok');
            }
        }
    }
}

function onButtonTrack() {
    if (newStopMode) {
        return;
    }
    if (!newTrackMode) {
        document.getElementById('button-track').classList.add('button-abort');
        document.getElementById('button-stop').classList.add('button-disabled');
        document.getElementById('canvas').classList.add('nok');
    } else {
        document.getElementById('button-track').classList.remove('button-abort');
        document.getElementById('button-track').classList.remove('button-finish');
        document.getElementById('button-stop').classList.remove('button-disabled');
        document.getElementById('canvas').classList.remove('nok');
        map.newTrackFinalize(loader.trams);
    }
    newTrackMode = !newTrackMode;
}

function onButtonStop() {
    if (newTrackMode) {
        return;
    }
    if (!newStopMode) {
        document.getElementById('button-stop').classList.add('button-abort');
        document.getElementById('button-track').classList.add('button-disabled');
        document.getElementById('canvas').classList.add('nok');
    } else {
        document.getElementById('button-stop').classList.remove('button-abort');
        document.getElementById('button-track').classList.remove('button-disabled');
        document.getElementById('canvas').classList.remove('nok');
    }
    newStopMode = !newStopMode;
}
