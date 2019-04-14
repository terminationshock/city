function convertInt(input) {
    return parseInt(input, 10);
}

function generateRandomId() {
    var id = "";
    id += Math.random().toString(36).substr(2, 5);
    id += Math.random().toString(36).substr(2, 5);
    id += Math.random().toString(36).substr(2, 5);
    return id;
}

function getClassOf(instance) {
    return instance.constructor.name;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
