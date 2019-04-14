function error(message, object, resolution) {
    console.error(message);
    if (resolution === null) {
        throw new Error(message);
    } else {
        resolution.call(object);
    }
    alert(message);
}
