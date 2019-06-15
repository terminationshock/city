var game = new Phaser.Game('100', '100', Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update });
var loader = new Loader();
var map = new Map();
var state = StateDefault.change();
var config;
var cursors;
var mouseDown = false;
var disableUI = true;

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
    game.load.text('world', 'city/world.dat');
    game.load.text('tracks', 'city/tracks.dat');
    game.load.text('stops', 'city/stops.dat');
    game.load.text('trams', 'city/trams.dat');
    game.load.json('config', 'city/config.json');
}

function updateUI() {
    state.setButtons();
    state.setCursor();
}

function create() {
    cursors = game.input.keyboard.createCursorKeys();
    Phaser.Canvas.setTouchAction(game.canvas, 'auto');

    game.stage.backgroundColor = config.Street.color;
    map.loadMap(game.cache.getText('world'));
    map.initTiles();
    map.loadTracks(game.cache.getText('tracks'));
    map.loadStops(game.cache.getText('stops'));
    map.generateItems(loader.houses, loader.trees, loader.cars);
    map.loadTrams(game.cache.getText('trams'), loader.trams);

    game.world.resize(map.getWidth(), map.getHeight());
    map.draw();

    var dt = 1.0 / config.World.stepsPerSecond;
    game.time.events.loop(dt, step);

    if (disableUI) {
       document.getElementById('button-track').style.display = 'none';
       document.getElementById('button-stop').style.display = 'none';
       document.getElementById('button-tram').style.display = 'none';
       document.getElementById('button-abort').style.display = 'none';
       document.getElementById('button-finish').style.display = 'none';
    } else {
        document.getElementById('button-track').addEventListener('click', onButtonTrack);
        document.getElementById('button-stop').addEventListener('click', onButtonStop);
        document.getElementById('button-tram').addEventListener('click', onButtonTram);
        document.getElementById('button-abort').addEventListener('click', onButtonAbort);
        document.getElementById('button-finish').addEventListener('click', onButtonFinish);
    }
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

    if (!disableUI) {
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
}
