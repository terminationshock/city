class StateDefault extends State {
    static change() {
        return new StateDefault();
    }

    setButtons() {
        UI.buttonNewTrack(true, false);
        UI.buttonNewStop(true, false);
        UI.buttonNewTram(true, false);
        UI.buttonAbort(false);
        UI.buttonFinish(false);
    }

    setCursor() {
        UI.setCursorDefault();
    }

    click(x, y, map) {
        if (map.showTramClick(x - game.camera.x, y - game.camera.y)) {
            return StateTramInfo.change();
        }
        return this;
    }

    isClickable() {
        return true;
    }
};
