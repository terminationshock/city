/* This file is part of City.

 * City is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * City is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with City.  If not, see <http://www.gnu.org/licenses/>.
*/

var game = new Phaser.Game({width: '100', height: '100', renderer: Phaser.CANVAS, antialias: false, state: { preload: preload, create: create, update: update }});
var loader = new Loader();
var map = new Map();
var config;
var cursors;

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
