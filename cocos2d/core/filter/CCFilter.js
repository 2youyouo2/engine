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

var Filter = cc.Class({
    name: 'cc.Filter',
    extends: cc._RendererInSG,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/Filter',
        help: 'i18n:COMPONENT.help_url.filter',
        executeInEditMode: true,
        inspector: 'app://editor/builtin/inspector/inspectors/comps/filter.js'
    },

    properties: {
        preview: {
            default: false,
            editorOnly: true
        },
        filters: {
            default: [],
            type: [cc.FilterShader]
        }
    },

    onLoad: function () {
      var filters = this.filters;
      for (var i = 0, l = filters.length; i < l; i++) {
        filters[i].init();
      }

      this._sgNode.filters = filters;
    },

    _createSgNode: function () {
        var sgNode = new cc.FilterNode();

        sgNode.setBeginDrawCallback(this.onBeginDraw.bind(this));
        sgNode.setEndDrawCallback(this.onEndDraw.bind(this));

        return sgNode;
    },

    _initSgNode: function () {},

    onBeginDraw: function () {
        if (CC_EDITOR && !this.preview) return false;

        var filters = this._filters = this.filters.filter(function (filter) {
            return filter.valid && filter.valid();
        });

        if (!filters || filters.length <= 0) {
            return false;
        }

        return true;
    },

    onEndDraw: function () {
        var filters = this._filters;
        if (!filters || filters.length <= 0) {
            return;
        }

        var sgNode = this._sgNode;

        var input = sgNode.getSourceTexture();
        var textures = {'SourceGraphic': input};

        for (var i = 0, l = filters.length; i < l; i++) {
            var filter = filters[i];

            if (!filter.valid() || !filter.enabled) continue;

            var inputName = filter.input;

            if (inputName && textures[inputName]) {
                input = textures[inputName];
            }

            if (i === l - 1) {
                filter.apply(sgNode, cc.winSize, input, null);
            }
            else {
                var output = sgNode.getTexture();

                if (filter.apply(sgNode, cc.winSize, input, output)) {
                    input = output;

                    var outputName = filter.output || i;
                    textures[outputName] = output;
                }
            }
        }

        for (var key in textures) {
            sgNode.returnTexture(textures[key]);
        }
    }
});

cc.Filter = module.exports = Filter;
