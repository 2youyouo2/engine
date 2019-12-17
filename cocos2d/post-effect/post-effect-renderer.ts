
import { ccclass, property } from '../core/platform/CCClassDecorator';
import Material from '../core/assets/material/CCMaterial';


export class PostEffectCommand {
    passIndex = 0;
    values: {};
    constructor (passIndx: number, values: {}) {
        this.passIndex = passIndx;
        this.values = values;
    }
}
cc.PostEffectCommand = PostEffectCommand;

@ccclass('cc.PostEffectRenderer')
export default class PostEffectRenderer {
    @property({type: Material})
    _material: Material = null;

    @property({type: Material})
    get material () {
        return this._material;
    }
    set material (v) {
        this._material = v;
    }

    _commands: PostEffectCommand[] = [];
    get commands () {
        return this._commands;
    }

    init () {

    }
}

cc.PostEffectRenderer = PostEffectRenderer;
