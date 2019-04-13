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
    document.getElementById('button-finish').addEventListener('click', onButtonFinish);
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

    if (newTrackMode || newStopMode) {
        if (game.input.mousePointer.leftButton.isDown) {
            mouseDown = true;
        }
        if (game.input.mousePointer.leftButton.isUp && mouseDown) {
            mouseDown = false;
            if (newTrackMode) {
                map.newTrackClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false);
            } else if (newStopMode) {
                map.newStopClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false);
            }
        } else {
            var ok = null;
            if (newTrackMode) {
                ok = map.newTrackClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true);
            } else if (newStopMode) {
                ok = map.newStopClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true);
            }
            ui.setCursorOk(ok);
        }
    }
}

function onButtonTrack() {
    ui.setButtonActive('button-track');
    ui.setCursorOk(false);
    newTrackMode = true;
}

function onButtonStop() {
    ui.setButtonActive('button-stop');
    ui.setCursorOk(false);
    newStopMode = true;
}

function onButtonFinish() {
    if (newTrackMode) {
        map.newTrackFinalize(loader.trams);
    }
    ui.setButtonsInactive();
    ui.setCursorDefault();
    newTrackMode = false;
    newStopMode = false;
}
