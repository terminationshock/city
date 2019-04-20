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
        this.sprites.forEach(function(sprite) {
            group.add(sprite);
        });
    }

    remove() {
        this.sprites.forEach(function(sprite) {
            sprite.destroy();
        });
    }
};
