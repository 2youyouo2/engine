import murmurhash2 from '../../../renderer/murmurhash2_gc';
import utils from './utils';
import Pass from '../../../renderer/core/pass';
import Effect from './effect';
import EffectBase from './effect-base';

const gfx = cc.gfx;

export default class EffectVariant extends EffectBase {
    _effect: Effect;
    _passes: Pass[] = [];
    _technique = null;
    _hash = 0;

    get effect () {
        return this._effect;
    }

    get name () {
        return this._effect.name + ' (variant)';
    }

    get passes () {
        return this._passes;
    }

    constructor (effect: Effect) {
        super();

        if (effect instanceof EffectVariant) {
            effect = effect.effect;
        }
        this.init(effect);
    }

    _onEffectChanged () {
    }

    init (effect) {
        this._effect = effect;
        this._dirty = true;
        
        if (effect) {
            this._technique = effect._technique;
            let passes = this._technique.passes;
            for (let i = 0; i < passes.length; i++) {
                this._passes[i] = Object.setPrototypeOf({}, passes[i]);
                this._passes[i]._properties = Object.setPrototypeOf({}, passes[i]._properties);
                this._passes[i]._defines = Object.setPrototypeOf({}, passes[i]._defines);
            }
        }
    }

    updateHash (hash: number) {

    }

    getHash () {
        if (!this._dirty) return this._hash;
        this._dirty = false;

        let hash = '';
        hash += utils.serializePasses(this._passes);

        let effect = this._effect;
        if (this._effect) {
            hash += utils.serializePasses(effect._technique.passes);
        }

        this._hash = murmurhash2(hash, 666);

        this.updateHash(this._hash);

        return this._hash;
    }
}

cc.EffectVariant = EffectVariant;
