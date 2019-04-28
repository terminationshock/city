class StateNewStop extends State {
    static change() {
        return new StateNewStop();
    }

    setButtons() {
        UI.buttonNewTrack(false, false);
        UI.buttonNewStop(true, true);
        UI.buttonNewTram(false, false);
        UI.buttonAbort(false);
        UI.buttonFinish(true);
    }

    setCursor() {
        UI.setCursorNok();
    }

    click(x, y, map) {
        map.newStopClick(x, y, false);
        return this;
    }

    hover(x, y, map) {
        if (map.newStopClick(x, y, true)) {
            UI.setCursorOk();
        } else {
            UI.setCursorNok();
        }
    }
};
