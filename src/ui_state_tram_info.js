class StateTramInfo extends State {
    static change() {
        return new StateTramInfo();
    }

    setButtons() {
        UI.buttonNewTrack(false, false);
        UI.buttonNewStop(false, false);
        UI.buttonNewTram(false, false);
        UI.buttonAbort(true);
        UI.buttonFinish(true);
    }

    setCursor() {
        UI.setCursorDefault();
    }

    abort(map) {
        map.showTramClick(-1, -1);
    }

    finish(map) {
        this.abort(map);
    }

    click(x, y, map) {
        return StateDefault.change().click(x, y, map);
    }

    isClickable() {
        return true;
    }
};
