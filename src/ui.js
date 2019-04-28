class UI {
    static disableButtons() {
        document.getElementById('button-track').classList.add('button-disabled');
        document.getElementById('button-stop').classList.add('button-disabled');
        document.getElementById('button-tram').classList.add('button-disabled');
    }

    static enableButtons() {
        document.getElementById('button-track').classList.remove('button-disabled');
        document.getElementById('button-stop').classList.remove('button-disabled');
        document.getElementById('button-tram').classList.remove('button-disabled');
    }

    static setButtonActive(id, showAbort) {
        UI.disableButtons();
        document.getElementById(id).classList.remove('button-disabled');
        document.getElementById(id).classList.add('button-active');
        document.getElementById('button-finish').classList.remove('button-disabled');
        if (showAbort) {
            document.getElementById('button-abort').classList.remove('button-disabled');
        }
    }

    static setButtonsInactive() {
        document.getElementById('button-track').classList.remove('button-active');
        document.getElementById('button-stop').classList.remove('button-active');
        document.getElementById('button-tram').classList.remove('button-active');
        document.getElementById('button-abort').classList.add('button-disabled');
        document.getElementById('button-finish').classList.add('button-disabled');
        UI.enableButtons();
    }

    static setCursorOk(ok) {
        if (ok) {
            document.getElementById('canvas').classList.remove('nok');
            document.getElementById('canvas').classList.add('ok');
        } else {
            document.getElementById('canvas').classList.remove('ok');
            document.getElementById('canvas').classList.add('nok');
        }
    }

    static setCursorDefault() {
        document.getElementById('canvas').classList.remove('ok');
        document.getElementById('canvas').classList.remove('nok');
    }

    static disableSpinner() {
        document.getElementById('spinner').style.display = 'none';
    }
};
