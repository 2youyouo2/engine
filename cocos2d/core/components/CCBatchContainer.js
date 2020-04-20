
const RenderComponent = require('./CCRenderComponent');
const RenderFlow = require('../renderer/render-flow');

let BatchContainer = cc.Class({
    name: 'cc.BatchContainer',
    extends: RenderComponent,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/BatchContainer',
    },

    ctor () {
        this._dirty = true;
    },

    setDirty (dirty) {
        this._dirty = dirty;
    },

    isDirty () {
        return this._dirty;
    },

    onEnable () {
        RenderComponent.prototype.onEnable.call(this);
        this.node._renderFlag |= RenderFlow.FLAG_OPACITY_COLOR | RenderFlow.FLAG_POST_RENDER;
    },

    onDisable () {
        RenderComponent.prototype.onDisable.call(this);
        this.node._renderFlag &= ~(RenderFlow.FLAG_OPACITY_COLOR | RenderFlow.FLAG_POST_RENDER);
    },

    _checkBacth () {
        return false;
    }
})

export default cc.BatchContainer = BatchContainer;
