import PostEffectRenderer from '../post-effect-renderer';

import { ccclass, property } from '../../core/platform/CCClassDecorator';

@ccclass('cc.BloomPostEffectRenderer')
export default class BloomPostEffectRenderer extends PostEffectRenderer {
    get defaultMaterialName () {
        return 'builtin-bloom-post-effect';
    }

    @property({type: cc.Float})
    _threshold: number = 0.5;
    @property({type: cc.Float})
    get threshold () {
        return this._threshold;
    }
    set threshold (v) {
        this._threshold = v;
        this._material.setProperty('threshold', v);
    }

    @property({type: cc.Float})
    _softKnee: number = 0.5;
    @property({type: cc.Float})
    get softKnee () {
        return this._softKnee;
    }
    set softKnee (v) {
        this._softKnee = v;
        this._material.setProperty('softKnee', v);
    }

    @property({type: cc.Float})
    _sampleScale: number = 0.5;
    @property({type: cc.Float})
    get sampleScale () {
        return this._sampleScale;
    }
    set sampleScale (v) {
        this._sampleScale = v;
        this._material.setProperty('sampleScale', v);
    }

    _updateMaterial () {
        this._material.setProperty('threshold', this._threshold);
        this._material.setProperty('softKnee', this._softKnee);
        this._material.setProperty('sampleScale', this._sampleScale);
    }
}

PostEffectRenderer.registerRenderer('Bloom', BloomPostEffectRenderer);
