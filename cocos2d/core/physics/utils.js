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

const VEC2_ZERO = cc.Vec2.ZERO;

const { mat4, mat23, vec2 } = cc.vmath;
const _mat4_temp = mat4.create();
const _mat4_temp2 = mat4.create();
const _vec2_temp = vec2.create();

function getWorldRTS (node, rts) {
    rts.scale.x = node.scaleX;
    rts.scale.y = node.scaleY;

    let parent = node.parent;
    while (!(parent instanceof cc.Scene)) {
        rts.scale.x *= parent.scaleX;
        rts.scale.y *= parent.scaleY;
        parent = parent.parent;
    }

    let matrix = node._worldMatrix;
    rts.rotation = Math.atan2(matrix.m01/rts.scale.x, matrix.m00/rts.scale.x) * 180 / Math.PI;
    rts.position = vec2.transformMat4(rts.position, VEC2_ZERO, matrix);
}

function setWorldRT (node, rts) {
    let parentMatrix = node.parent._worldMatrix;
    mat4.invert(_mat4_temp, parentMatrix);

    // position
    node.position = vec2.transformMat4(_vec2_temp, rts.position, _mat4_temp);

    // rotation
    mat4.identity(_mat4_temp2);
    mat4.rotateZ(_mat4_temp2, _mat4_temp2, rts.rotation * Math.PI / 180);

    mat4.mul(_mat4_temp2, _mat4_temp, _mat4_temp2);
    node.angle = Math.atan2(_mat4_temp2.m01/rts.scale.x, _mat4_temp2.m00/rts.scale.x) * 180 / Math.PI;
}

function getWorldRotation (node) {
    var rot = node.angle;
    var parent = node.parent;
    while (parent.parent) {
        rot += parent.angle;
        parent = parent.parent;
    }
    return rot;
}

function getWorldScale (node, out) {
    var scaleX = node.scaleX;
    var scaleY = node.scaleY;

    var parent = node.parent;
    while(parent.parent){
        scaleX *= parent.scaleX;
        scaleY *= parent.scaleY;

        parent = parent.parent;
    }

    out = out || cc.v2();
    out.x = scaleX;
    out.y = scaleY;

    return out;
}

function getLocalRotation (node, rotation) {
    let parent = node.parent;
    while (parent.parent) {
        rotation -= parent.angle;
        parent = parent.parent;
    }
    return rotation;
}

module.exports = {
    getWorldRotation: getWorldRotation,
    getWorldScale: getWorldScale,
    getLocalRotation: getLocalRotation,

    getWorldRTS,
    setWorldRT,
};
