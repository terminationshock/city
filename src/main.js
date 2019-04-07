var game = new Phaser.Game('100', '100', Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update });
var loader = new Loader();
var map = new Map();
var config;
var cursors;
var newTrackMode = false;
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

    document.getElementById('button-tool').addEventListener('click', onButtonTool);
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
            var closedTrack = map.newTrackClick(game.input.mousePointer.x, game.input.mousePointer.y);
            if (closedTrack) {
                document.getElementById('button-tool').classList.remove('button-abort');
                document.getElementById('button-tool').classList.add('button-finish');
            } else {
                document.getElementById('button-tool').classList.add('button-abort');
                document.getElementById('button-tool').classList.remove('button-finish');
            }
        }
    }
}

function onButtonTool() {
    document.getElementById('button-tool').classList.remove('button-abort');
    document.getElementById('button-tool').classList.remove('button-finish');
    if (!newTrackMode) {
        document.getElementById('button-tool').classList.add('button-abort');
    } else {
        map.newTrackFinalize(loader.trams);
    }
    newTrackMode = !newTrackMode;
}
