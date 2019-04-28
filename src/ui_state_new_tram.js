class StateNewTram extends State {
    static change() {
        return new StateNewTram();
    }

    setButtons() {
        UI.buttonNewTrack(false, false);
        UI.buttonNewStop(false, false);
        UI.buttonNewTram(true, true);
        UI.buttonAbort(true);
        UI.buttonFinish(true);
    }

    setCursor() {
        UI.setCursorNok();
    }

    abort(map) {
        map.newTramAbort();
    }

    finish(map) {
        this.abort(map);
    }

    click(x, y, map) {
        map.newTramClick(x, y, false, loader.trams);
        return this;
    }

    hover(x, y, map) {
        if (map.newTramClick(x, y, true, loader.trams)) {
            UI.setCursorOk();
        } else {
            UI.setCursorNok();
        }
    }
};
