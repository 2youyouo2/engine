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

import Assembler2D from '../../assembler-2d';
import MeshBuffer from '../mesh-buffer';

const BatchContainer = require('../../../components/CCBatchContainer');
const RenderFlow = require('../../render-flow');

function walk (node, cb) {
    cb(node);
    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        walk(children[i], cb);
    }
}

export default class BatchContainerAssembler extends Assembler2D {
    constructor () {
        super();

        this._buffer = null;
        this._vfmt = null;
        
        this._verticesOffset = 0;
        this._indicesOffset = 0;

        this._collectInfos = this._collectInfos.bind(this);
    }

    _collectInfos (childNode) {
        if (childNode === this._renderComp.node) return;
        let renderComp = childNode._renderComponent;
        if (!renderComp) {
            return;
        }
        let assembler = renderComp._assembler;
        if (!assembler) {
            return;
        }
        let vfmt = assembler.getVfmt();
        if (!this._vfmt) {
            this._vfmt = vfmt;
            if (!this._buffer) {
                this._buffer = new MeshBuffer(cc.renderer._handle, vfmt);
            }
        }
        else if (vfmt !== this._vfmt) {
            cc.warn(`BatchContainer : child node [${childNode.name}] vfmt is different, can not batch.`)
            return;
        }

        assembler._containerVerticesOffset = this._verticesOffset;
        assembler._containerIndicesOffset = this._indicesOffset;
        assembler._batchContainer = this;

        this._buffer.request(assembler.verticesCount, assembler.indicesCount);

        assembler.updateContainerIndices();

        this._verticesOffset += assembler.verticesFloats;
        this._indicesOffset += assembler.indicesCount;

        childNode._renderFlag |= RenderFlow.FLAG_UPDATE_RENDER_DATA | RenderFlow.FLAG_OPACITY_COLOR;
        renderComp._vertsDirty = true;
    }

    fillBuffers (comp, renderer) {
        if (CC_EDITOR) return;

        if (comp.isDirty()) {
            this._verticesOffset = 0;
            this._indicesOffset = 0;
            if (this._buffer) {
                this._buffer.reset();
            }
            walk(comp.node, this._collectInfos);
            
            comp.setDirty(false);
        }
        
        if (this._buffer) {
            this._buffer.indiceStart = 0;
            cc.renderer._handle._buffer = this._buffer;
        }
        cc.renderer._handle._batchContainer = this;
    }

    postFillBuffers (mask, renderer) {
        if (CC_EDITOR) return;
        
        if (this._buffer) {
            this._buffer._dirty = true;
            this._buffer.uploadData();
        }
        cc.renderer._handle._flush();
        cc.renderer._handle._batchContainer = null;
    }
}

BatchContainerAssembler.register(BatchContainer, BatchContainerAssembler);
