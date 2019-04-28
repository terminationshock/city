class StateNewTrack extends State {
    static change() {
        return new StateNewTrack();
    }

    setButtons() {
        UI.buttonNewTrack(true, true);
        UI.buttonNewStop(false, false);
        UI.buttonNewTram(false, false);
        UI.buttonAbort(true);
        UI.buttonFinish(true);
    }

    setCursor() {
        UI.setCursorNok();
    }

    abort(map) {
        map.newTrackAbort();
    }

    finish(map) {
        map.newTrackFinalize();
    }

    click(x, y, map) {
        map.newTrackClick(x, y, false);
        return this;
    }

    hover(x, y, map) {
        if(map.newTrackClick(x, y, true)) {
            UI.setCursorOk();
        } else {
            UI.setCursorNok();
        }
    }
};
