import textureUtil from '../core/utils/texture-util';

export default class PostEffectCommand {
    _passIndex = 0;
    _properties: {};

    get properties () {
        return this._properties;
    }

    constructor (passIndx: number, properties: {}) {
        this._passIndex = passIndx;
        this._properties = properties;
    }

    setProperty (name, value) {
        let properties = this._properties;
        let prop = properties[name];
        if (prop === undefined) {
            cc.warnID(9103, 'PostEffectCommand', name);
            return;
        }

        if (Array.isArray(value)) {
            if (prop.length !== value.length) {
                cc.warnID(9105, 'PostEffectCommand', name);
                return;
            }
            for (let i = 0; i < value.length; i++) {
                prop[i] = value[i];
            }
        }
        else if (value instanceof cc.Texture2D) {
            function loaded () {
                properties[name] = prop;
            }

            if (!value.loaded) {
                value.once('load', loaded, this);
                textureUtil.postLoadTexture(value);
                return;
            }
        }

        properties[name] = prop;
    }
}
cc.PostEffectCommand = PostEffectCommand;
