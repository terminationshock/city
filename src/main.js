var game = new Phaser.Game('100', '100', Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update });
var loader = new Loader();
var map = new Map();
var config;
var cursors;

var mouseDown = false;
const MODE_DEFAULT = 0;
const MODE_TRACK = 1;
const MODE_STOP = 2;
const MODE_TRAM = 3;
var mode = MODE_DEFAULT;

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
    document.getElementById('button-tram').addEventListener('click', onButtonTram);
    document.getElementById('button-abort').addEventListener('click', onButtonAbort);
    document.getElementById('button-finish').addEventListener('click', onButtonFinish);
    UI.enableButtons();
    UI.disableSpinner();
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

    if (game.input.mousePointer.leftButton.isDown) {
        mouseDown = true;
    }

    if (game.input.mousePointer.leftButton.isUp && mouseDown) {
        mouseDown = false;
        switch(mode) {
            case MODE_DEFAULT:
                map.showTramClick(game.input.mousePointer.worldX - game.camera.x, game.input.mousePointer.worldY - game.camera.y);
                break;
            case MODE_TRACK:
                map.newTrackClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false);
                break;
            case MODE_STOP:
                map.newStopClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false);
                break;
            case MODE_TRAM:
                map.newTramClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, false, loader.trams);
                break;
        }
    } else {
        var ok = null;
        switch(mode) {
            case MODE_TRACK:
                ok = map.newTrackClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true);
                break;
            case MODE_STOP:
                ok = map.newStopClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true);
                break;
            case MODE_TRAM:
                ok = map.newTramClick(game.input.mousePointer.worldX, game.input.mousePointer.worldY, true, loader.trams);
                break;
        }
        if (ok !== null) {
            UI.setCursorOk(ok);
        }
    }
}

function onButtonTrack() {
    UI.setButtonActive('button-track', true);
    UI.setCursorOk(false);
    mode = MODE_TRACK;
}

function onButtonStop() {
    UI.setButtonActive('button-stop', false);
    UI.setCursorOk(false);
    mode = MODE_STOP;
}

function onButtonTram() {
    UI.setButtonActive('button-tram', true);
    UI.setCursorOk(false);
    mode = MODE_TRAM;
}

function onButtonAbort() {
    switch(mode) {
        case MODE_TRACK:
            map.newTrackAbort();
            break;
        case MODE_TRAM:
            map.newTramAbort();
            break;
    }
    UI.setButtonsInactive();
    UI.setCursorDefault();
    mode = MODE_DEFAULT;
}

function onButtonFinish() {
    if (mode === MODE_TRACK) {
        map.newTrackFinalize();
    }
    UI.setButtonsInactive();
    UI.setCursorDefault();
    mode = MODE_DEFAULT;
}
