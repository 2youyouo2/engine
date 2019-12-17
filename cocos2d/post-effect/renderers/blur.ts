import PostEffectRenderer, { PostEffectCommand } from '../post-effect-renderer';
import { ccclass, property } from '../../core/platform/CCClassDecorator';
import Vec2 from '../../core/value-types/vec2';

let _direction_v2 = new Vec2;

@ccclass('cc.BlurPostEffectRenderer')
export default class BlurPostEffectRenderer extends PostEffectRenderer {
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
                Vec2.set(commands[i].values.direction, (i+1) * step, 0);
            }
            else {
                Vec2.set(commands[i].values.direction, 0, (i%2+1) * step);
            }
        }
    }

    init () {
        let commands = this._commands;
        commands.length = 0;
        for (let i = 0, l = this._iteration * 2; i < l; i++) {
            let properties = { direction: new Vec2() };
            commands.push(new PostEffectCommand(0, properties));
        }

        this._updateBlurSize();
    }
}

cc.BlurPostEffectRenderer = BlurPostEffectRenderer;