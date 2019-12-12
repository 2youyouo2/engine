/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

const Component = require('./CCComponent');
import { ccclass, menu, property, executeInEditMode } from '../platform/CCClassDecorator';

@ccclass('cc.PostEffect')
@executeInEditMode
@menu('i18n:MAIN_MENU.component.renderers/PostEffect')
export default class PostEffect extends Component {
    @property({type: cc.Material})
    _materials: cc.Material[] = [];

    @property({type: cc.Material})
    get materials () {
        return this._materials;
    }
    set materials (v) {
        this._materials = v;
        this._updateMaterials();
    }

    __preload () {
        this._updateMaterials();
    }

    _updateMaterials () {
        let materials = this._materials;
        for (let i = 0; i < materials.length; i++) {
            if (!materials[i]) continue;
            materials[i] = cc.MaterialVariant.create(materials[i], this);
        }
    }

    onEnable () {
        if (CC_JSB) return;
        let camera = this.getComponent(cc.Camera);
        camera && camera._camera.setPostEffect(this);
    }

    onDisable () {
        if (CC_JSB) return;
        let camera = this.getComponent(cc.Camera);
        camera && camera._camera.setPostEffect(null);
    }
}

cc.PostEffect = PostEffect;
