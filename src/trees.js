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

class Trees {
    constructor(tile, treeImages) {
        this.tile = tile;
        this.treeImages = treeImages;
        this.trees = [];
        this.sprites = [];
    }

    generateTrees() {
        for (var i = 0; i < config.Tree.numTrees; i++) {
            var tree = this.newTree();
            if (tree !== null) {
                this.trees.push(tree);
            }
        }
        this.trees.sort(function(a, b) {
            return a.y - b.y;
        });
    }

    newTree() {
        var tree = this.treeImages[Math.floor(Math.random() * this.treeImages.length)];
        var image = game.cache.getImage(tree);
        var imgX = this.tile.imgX + Math.floor(Math.random() * (config.Tile.width - image.width));
        var imgY = this.tile.imgY + Math.floor(Math.random() * config.Tile.height) - image.height;

        var x = imgX + Math.floor(image.width / 2);
        var y = imgY + image.height;

        if (this.tile.inside(x, y, config.Tree.insideFactor)) {
            return {y: y, tree: tree, imgX: imgX, imgY: imgY};
        }
        return null;
    }

    draw(group) {
        for (var tree of this.trees) {
            this.sprites.push(game.add.image(tree.imgX, tree.imgY, tree.tree));
        }
        this.sprites.forEach(sprite => group.add(sprite));
    }

    remove() {
        this.sprites.forEach(sprite => sprite.destroy());
    }
};
