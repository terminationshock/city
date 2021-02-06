var game = new Phaser.Game('100', '100', Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update });
var loader = new Loader();
var map = new Map();
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
    game.load.text('world', 'city/world.dat');
    game.load.json('config', 'city/config.json');
}

function create() {
    cursors = game.input.keyboard.createCursorKeys();
    game.kineticScrolling = game.plugins.add(Phaser.Plugin.KineticScrolling);
    game.kineticScrolling.configure({
        kineticMovement: true,
        timeConstantScroll: 325,
        horizontalScroll: true,
        verticalScroll: true,
        horizontalWheel: false,
        verticalWheel: false
    });
    game.kineticScrolling.start();

    game.stage.backgroundColor = config.Street.color;
    map.loadMap(game.cache.getText('world'));
    map.initTiles();
    map.generateItems(loader.houses, loader.trees, loader.cars);

    game.world.resize(map.getWidth(), map.getHeight());
    document.getElementById('vehicle-canvas').width = config.Car.imgSize * config.Vehicle.headingOrder.length;
    document.getElementById('vehicle-canvas').height = config.Car.imgSize * config.Vehicle.headingOrder.length;
    map.draw();

    var dt = 1000 / config.World.stepsPerSecond;
    game.time.events.loop(dt, step);

    var zoom = Math.max(1, window.devicePixelRatio * 0.6);
    game.camera.scale.setTo(zoom, zoom);
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
}
