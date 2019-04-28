var game = new Phaser.Game('100', '100', Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update });
var loader = new Loader();
var map = new Map();
var state = StateDefault.change();
var config;
var cursors;
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

function updateUI() {
    state.setButtons();
    state.setCursor();
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
    UI.disableSpinner();
    updateUI();
}

function onButtonTrack() {
    state = StateNewTrack.change();
    updateUI();
}

function onButtonStop() {
    state = StateNewStop.change();
    updateUI();
}

function onButtonTram() {
    state = StateNewTram.change();
    updateUI();
}

function onTramInfo() {
    state = StateTramInfo.change();
    updateUI();
}

function onButtonAbort() {
    state.abort(map);
    state = StateDefault.change();
    updateUI();
}

function onButtonFinish() {
    state.finish(map);
    state = StateDefault.change();
    updateUI();
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
        state = state.click(game.input.mousePointer.worldX, game.input.mousePointer.worldY, map);
        updateUI();
    } else {
        state.hover(game.input.mousePointer.worldX, game.input.mousePointer.worldY, map);
    }
}
