class UI {
    static disableSpinner() {
        document.getElementById('spinner').style.display = 'none';
    }

    static buttonNewTrack(visible, active) {
        if (visible) {
            document.getElementById('button-track').classList.remove('button-disabled');
        } else {
            document.getElementById('button-track').classList.add('button-disabled');
        }
        if (active) {
            document.getElementById('button-track').classList.add('button-active');
        } else {
            document.getElementById('button-track').classList.remove('button-active');
        }
    }

    static buttonNewStop(visible, active) {
        if (visible) {
            document.getElementById('button-stop').classList.remove('button-disabled');
        } else {
            document.getElementById('button-stop').classList.add('button-disabled');
        }
        if (active) {
            document.getElementById('button-stop').classList.add('button-active');
        } else {
            document.getElementById('button-stop').classList.remove('button-active');
        }
    }

    static buttonNewTram(visible, active) {
        if (visible) {
            document.getElementById('button-tram').classList.remove('button-disabled');
        } else {
            document.getElementById('button-tram').classList.add('button-disabled');
        }
        if (active) {
            document.getElementById('button-tram').classList.add('button-active');
        } else {
            document.getElementById('button-tram').classList.remove('button-active');
        }
    }

    static buttonAbort(visible) {
        if (visible) {
            document.getElementById('button-abort').classList.remove('button-disabled');
        } else {
            document.getElementById('button-abort').classList.add('button-disabled');
        }
    }

    static buttonFinish(visible) {
        if (visible) {
            document.getElementById('button-finish').classList.remove('button-disabled');
        } else {
            document.getElementById('button-finish').classList.add('button-disabled');
        }
    }

    static setCursorDefault() {
        document.getElementById('canvas').classList.remove('ok');
        document.getElementById('canvas').classList.remove('nok');
    }

    static setCursorOk() {
        document.getElementById('canvas').classList.add('ok');
        document.getElementById('canvas').classList.remove('nok');
    }

    static setCursorNok() {
        document.getElementById('canvas').classList.remove('ok');
        document.getElementById('canvas').classList.add('nok');
    }














    static setCursorInfo(info) {
        if (info) {
            if (mode === MODE_DEFAULT || mode === MODE_TRAM_INFO) {
                document.getElementById('canvas').classList.add('info');
            }
        } else {
            document.getElementById('canvas').classList.remove('info');
        }
    }

    static setCursorDefault() {
        document.getElementById('canvas').classList.remove('ok');
        document.getElementById('canvas').classList.remove('nok');
    }
};
