import PostEffectRenderer from '../post-effect-renderer';
import PostEffectCommand from '../post-effect-command';

import { ccclass, property } from '../../core/platform/CCClassDecorator';

@ccclass('cc.BlurPostEffectRenderer')
export default class BlurPostEffectRenderer extends PostEffectRenderer {
    get defaultMaterialName () {
        return 'builtin-blur-post-effect';
    }

    @property({type: cc.Intger})
    _iteration: number = 2;
    @property({type: cc.Intger})
    get iteration () {
        return this._iteration;
    }
    set iteration (v) {
        this._iteration = v;
        this.init();
    }

    @property({type: cc.Float})
    _blurSize: number = 2;
    @property({type: cc.Float})
    get blurSize () {
        return this._blurSize;
    }
    set blurSize (v) {
        this._blurSize = v;
        this._updateBlurSize();
    }

    _updateBlurSize () {
        let m = this.material;
        if (!m) return;

        let iteration = this.iteration;
        let step = this._blurSize / iteration;
        let commands = this._commands;
        for (let i = 0, l = iteration * 2; i < l; i++) {
            if (i < iteration) {
                commands[i].setProperty('direction', [(i+1) * step, 0]);
            }
            else {
                commands[i].setProperty('direction', [0, (i%2+1) * step]);
            }
        }
    }

    init () {
        super.init();
        
        let commands = this._commands;
        commands.length = 0;
        for (let i = 0, l = this._iteration * 2; i < l; i++) {
            let properties = { direction: new Float32Array([0, 0]) };
            commands.push(new PostEffectCommand(0, properties));
        }

        this._updateBlurSize();
    }
}

PostEffectRenderer.registerRenderer('Blur', BlurPostEffectRenderer);
