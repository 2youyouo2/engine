
import { ccclass, property } from '../core/platform/CCClassDecorator';
import Material from '../core/assets/material/CCMaterial';
import PostEffectCommand from './post-effect-command';

@ccclass('cc.PostEffectRenderer')
export default class PostEffectRenderer {
    static renderers = {};
    static registerRenderer (name: string, renderer: typeof PostEffectRenderer) {
        this.renderers[name] = renderer;
    }
    
    get defaultMaterialName () {
        return '';
    }

    @property({type: Material})
    _material: Material = null;
    @property({type: Material})
    get material () {
        return this._material;
    }
    set material (v) {
        this._material = cc.MaterialVariant.create(v);;
    }

    @property({type: cc.Boolean})
    _enabled = true;
    @property({
        type: cc.Boolean,
        visible: false
    })
    get enabled () {
        return this._enabled;
    }
    set enabled (v) {
        this._enabled = v;
    }

    _commands: PostEffectCommand[] = [];
    get commands () {
        return this._commands;
    }

    init () {
        if (CC_EDITOR && !this.material && this.defaultMaterialName) {
            Editor.assetdb.queryAssets('', 'material', (err, results) => {
                if (err) {
                    Editor.error(err);
                    return;
                }
                if (results) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].url.indexOf(this.defaultMaterialName) === -1) continue;
                        _Scene.MaterialUtils.getMaterial(results[i].uuid).then(material => {
                            this.material = material;
                        });
                        return;
                    }
                }
            });
        }
    }
}

cc.PostEffectRenderer = PostEffectRenderer;
