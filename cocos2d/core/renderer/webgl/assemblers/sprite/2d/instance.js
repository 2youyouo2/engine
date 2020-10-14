/****************************************************************************
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

import Assembler2D from '../../../../assembler-2d';
import { getBuffer, getVBuffer, vfmtInstance, vfmtDataBuffer, getFloat32DataBuffer, initFreeIndexBuffer, getDataIndex, releaseDataIndex, setInstanceDataDirty, getInstanceTexture, getResizeDirty} from '../../../instance-buffer';

export default class InstanceSpriteAssembler extends Assembler2D {
    verticesCount = 1;
    dataPerVert = vfmtDataBuffer._bytes / 4;
    floatsPerVert = vfmtInstance._bytes / 4;

    instanceDataIndex = -1;
    dataBufferStart = 0;

    constructor () {
        super();
        this.isInstance = true;

        getBuffer();

        this._dataBufferArray = new Float32Array(this.dataPerVert);
    }

    initBlockInfo () {
        if (this.instanceDataIndex === -1) {
            initFreeIndexBuffer();

            this.instanceDataIndex = getDataIndex();
            this.dataBufferStart = this.instanceDataIndex * this.dataPerVert;

            this._updateMaterial();
        }
    }

    releaseBlockInfo () {
        if (this.instanceDataIndex !== -1) {
            releaseDataIndex(this.instanceDataIndex);
            this._dataBufferArray.fill(0);
            let buffer = this.get32fDataBuffer();
            buffer.set(this._dataBufferArray, this.instanceDataIndex * this.dataPerVert);
            this.instanceDataIndex = -1;
            setInstanceDataDirty(true);
        }
    }

    onEnable () {
        super.onEnable();
        this.initBlockInfo();
    }

    onDisable () {
        super.onDisable();
        this.releaseBlockInfo();
    }

    _updateMaterial () {
        let materials = this._renderComp.getMaterials();
        for (let i = 0; i < materials.length; i++) {
            let material = materials[i];
            let texture = this.getDataTexture();
            material.setProperty('instanceDataTexture', texture);
            material.setProperty('instanceDataTextureSize', new Float32Array([texture.width, texture.height]));
            material.define('CC_INSTANCE_TEXTURE_FLOAT32', !!cc.sys.glExtension('OES_texture_float'));
        }
    }

    updateColor () {

    }

    getVfmt () {
        return vfmtInstance;
    }

    getBuffer () {
        return getBuffer();
    }

    getVBuffer () {
        return getVBuffer();
    }

    get32fDataBuffer () {
        return getFloat32DataBuffer();
    }

    getDataTexture () {
        return getInstanceTexture();
    }

    fillBuffers (comp, renderer) {
        if (renderer.worldMatDirty) {
            this.onlyUpdateWorldVerts(comp); 
        }

        let instanceBuffer = getBuffer();
        let buffer = this.getVBuffer(); 
        buffer[instanceBuffer.instanceOffset * this.floatsPerVert] = this.instanceDataIndex;
        instanceBuffer.instanceOffset++;

        cc.renderer._handle._buffer = instanceBuffer;
        if (getResizeDirty()) {
            this._updateMaterial();
        }
    }

    updateWorldVerts (comp) {
        let buffer = this._dataBufferArray;

        let m = comp.node._worldMatrix.m;
        buffer[8] = m[0];
        buffer[9] = m[1];
        buffer[10] = m[4];
        buffer[11] = m[5];
        buffer[12] = m[12];
        buffer[13] = m[13];
    }

    onlyUpdateWorldVerts (comp) {
        this.updateWorldVerts (comp);

        let buffer = this.get32fDataBuffer();
        let compBuffer = this._dataBufferArray;

        let m = comp.node._worldMatrix.m;

        buffer[this.dataBufferStart + 8] = compBuffer[8] = m[0];
        buffer[this.dataBufferStart + 9] = compBuffer[9] = m[1];
        buffer[this.dataBufferStart + 10] = compBuffer[10] = m[4];
        buffer[this.dataBufferStart + 11] = compBuffer[11] = m[5];
        buffer[this.dataBufferStart + 12] = compBuffer[12] = m[12];
        buffer[this.dataBufferStart + 13] = compBuffer[13] = m[13];

        setInstanceDataDirty(true);
    }

    updateRenderData (sprite) {
        this.packToDynamicAtlas(sprite, sprite._spriteFrame);

        if (sprite._vertsDirty) {
            this.updateUVs(sprite);
            this.updateVerts(sprite);
            let buffer = this.get32fDataBuffer();
            buffer.set(this._dataBufferArray, this.instanceDataIndex * this.dataPerVert);
            setInstanceDataDirty(true);
            sprite._vertsDirty = false;
        }
    }

    updateUVs (sprite) {
        let uv = sprite._spriteFrame.uv;
        let buffer = this._dataBufferArray;
        buffer[0] = uv[0];
        buffer[1] = uv[1];

        // if (sprite._spriteFrame.isRotated()) {
        //     buffer[2] = uv[3];
        //     buffer[3] = uv[6];
        // }
        // else {
            buffer[2] = uv[6];
            buffer[3] = uv[7];
        // }

        buffer[14] = sprite._spriteFrame.isRotated() ? 1 : 0;

        // texture id
        buffer[15] = 1;
    }

    updateVerts (sprite) {
        let node = sprite.node,
            cw = node.width, ch = node.height,
            appx = node.anchorX * cw, appy = node.anchorY * ch,
            l, b, r, t;
        if (sprite.trim) {
            l = -appx;
            b = -appy;
            r = cw - appx;
            t = ch - appy;
        }
        else {
            let frame = sprite.spriteFrame,
                ow = frame._originalSize.width, oh = frame._originalSize.height,
                rw = frame._rect.width, rh = frame._rect.height,
                offset = frame._offset,
                scaleX = cw / ow, scaleY = ch / oh;
            let trimLeft = offset.x + (ow - rw) / 2;
            let trimRight = offset.x - (ow - rw) / 2;
            let trimBottom = offset.y + (oh - rh) / 2;
            let trimTop = offset.y - (oh - rh) / 2;
            l = trimLeft * scaleX - appx;
            b = trimBottom * scaleY - appy;
            r = cw + trimRight * scaleX - appx;
            t = ch + trimTop * scaleY - appy;
        }

        let buffer = this._dataBufferArray;
        buffer[4] = l;
        buffer[5] = b;
        buffer[6] = r;
        buffer[7] = t;
        this.updateWorldVerts(sprite);
    }
}
