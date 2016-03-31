/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Chukong Aipu reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var GraphicsNode = require('./graphics-node');
var LineCap      = require('./types').LineCap;
var LineJoin     = require('./types').LineJoin;

/**
 * @class Graphics
 * @extends _RendererUnderSG
 */
var Graphics = cc.Class({
    name: 'cc.Graphics',
    extends: cc._RendererUnderSG,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/Graphics',
    },

    properties: {
        _lineWidth: 1,
        _strokeColor: cc.Color.BLACK,
        _lineJoin: LineJoin.BEVEL,
        _lineCap: LineCap.BUTT,
        _fillColor: cc.Color.WHITE,

        lineWidth: {
            get: function () {
                return this._lineWidth;
            },
            set: function (value) {
                this._sgNode.lineWidth = this._lineWidth = value;
            }
        },

        lineJoin: {
            get: function () {
                return this._lineJoin;
            },
            set: function (value) {
                this._sgNode.lineJoin = this._lineJoin = value;
            }
        },

        lineCap: {
            get: function () {
                return this._lineCap;
            },
            set: function (value) {
                this._sgNode.lineCap = this._lineCap = value;
            }
        },

        strokeColor: {
            get: function () {
                return this._strokeColor;
            },
            set: function (value) {
                this._sgNode.strokeColor = this._strokeColor = value;
            }
        },

        fillColor: {
            get: function () {
                return this._fillColor;
            },
            set: function (value) {
                this._sgNode.fillColor = this._fillColor = value;
            }
        }
    },

    _createSgNode: function () {
        return new GraphicsNode();
    },

    _initSgNode: function () {
        var sgNode = this._sgNode;
        sgNode.lineWidth = this._lineWidth;
        sgNode.lineJoin = this._lineJoin;
        sgNode.lineCap = this._lineCap;
        sgNode.strokeColor = this._strokeColor;
        sgNode.fillColor = this._fillColor;
    },

    moveTo: function (x, y) {
        this._sgNode.moveTo(x, y);
    },

    lineTo: function (x, y) {
        this._sgNode.lineTo(x, y);
    },

    bezierCurveTo: function (c1x, c1y, c2x, c2y, x, y) {
        this._sgNode.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    },

    quadraticCurveTo: function (cx, cy, x, y) {
        this._sgNode.quadraticCurveTo(cx, cy, x, y);
    },

    arc: function (cx, cy, r, a0, a1, dir) {
        this._sgNode.arc(cx, cy, r, a0, a1, dir);
    },

    ellipse: function (cx, cy, rx, ry) {
        this._sgNode.ellipse(cx, cy, rx, ry);
    },

    circle: function (cx, cy, r) {
        this._sgNode.circle(cx, cy, r);
    },

    rect: function (x, y, w, h) {
        this._sgNode.rect(x, y, w, h);
    },

    roundRect: function (x, y, w, h, r) {
        this._sgNode.roundRect(x, y, w, h, r);
    },

    fillRect: function (x, y, w, h) {
        this._sgNode.rect(x, y, w, h);
        this._sgNode.fill();
    },

    clear: function () {
        this._sgNode.clear();
    },

    close: function () {
        this._sgNode.close();
    },

    stroke: function () {
        this._sgNode.stroke();
    },

    fill: function () {
        this._sgNode.fill();
    }
});

cc.Graphics = module.exports = Graphics;
