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

import Component from '../core/components/CCComponent';
import { ccclass, menu, property, executeInEditMode, inspector } from '../core/platform/CCClassDecorator';
import PostEffectRenderer from './post-effect-renderer';

@ccclass('cc.PostEffect')
@executeInEditMode
@menu('i18n:MAIN_MENU.component.renderers/PostEffect')
@inspector('packages://inspector/inspectors/comps/post-effect.js')
export default class PostEffect extends Component {
    @property({type: PostEffectRenderer})
    _renderers: PostEffectRenderer[] = [];

    @property({type: PostEffectRenderer})
    get renderers () {
        return this._renderers;
    }
    set renderers (v) {
        this._renderers = v;
        this._updateRenderers();
    }

    __preload () {
        this._updateRenderers();
    }

    _updateRenderers () {
        let renderers = this._renderers;
        for (let i = 0; i < renderers.length; i++) {
            if (!renderers[i]) continue;
            renderers[i].init();
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
