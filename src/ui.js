var ui = {};

ui.disableButtons = function () {
    document.getElementById('button-track').classList.add('button-disabled');
    document.getElementById('button-stop').classList.add('button-disabled');
    document.getElementById('button-tram').classList.add('button-disabled');
}

ui.enableButtons = function () {
    document.getElementById('button-track').classList.remove('button-disabled');
    document.getElementById('button-stop').classList.remove('button-disabled');
    document.getElementById('button-tram').classList.remove('button-disabled');
}

ui.setButtonActive = function (id) {
    ui.disableButtons();
    document.getElementById(id).classList.remove('button-disabled');
    document.getElementById(id).classList.add('button-active');
    document.getElementById('button-finish').classList.remove('button-disabled');
}

ui.setButtonsInactive = function () {
    document.getElementById('button-track').classList.remove('button-active');
    document.getElementById('button-stop').classList.remove('button-active');
    document.getElementById('button-tram').classList.remove('button-active');
    document.getElementById('button-finish').classList.add('button-disabled');
    ui.enableButtons();
}

ui.setCursorOk = function (ok) {
    if (ok) {
        document.getElementById('canvas').classList.remove('nok');
        document.getElementById('canvas').classList.add('ok');
    } else {
        document.getElementById('canvas').classList.remove('ok');
        document.getElementById('canvas').classList.add('nok');
    }
}

ui.setCursorDefault = function () {
    document.getElementById('canvas').classList.remove('ok');
    document.getElementById('canvas').classList.remove('nok');
}
