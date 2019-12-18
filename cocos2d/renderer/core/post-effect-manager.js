
import InputAssembler from './input-assembler';
import gfx from '../gfx';
import Pass from './pass';

let _textures = [];
let _usedTextures = [];
function getTexture (width, height) {
    let texture = _textures.pop();
    if (!texture) {
        texture = new cc.RenderTexture();
        texture.initWithSize(width, height, gfx.RB_FMT_D24S8);
    }
    else {
        texture.updateSize(width, height);
    }

    _usedTextures.push(texture);
    return texture;
}

function returnTextures () {
    for (let i = 0; i < _usedTextures.length; i++) {
        _textures.push(_usedTextures[i]);
    }
    _usedTextures.length = 0;
}

let _item = {
    passes: []
};
let _allPasses = [];
let _allCommands = {};

let _resolution = new Float32Array([0, 0]);

let _originFrameBuffer = null;
let _originTexture = null;

let _requestOriginTexture = false;

export default {
    _inited: false,

    init (renderer) {
        if (this._inited) return;
        this._inited = true;

        let gfxVFmt = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        ]);

        let vb = new gfx.VertexBuffer(
            renderer._device,
            gfxVFmt,
            gfx.USAGE_STATIC,
            new Float32Array([
                -1,-1,  0,0,
                -1,1,   0,1,
                1,1,    1, 1, 
                1,-1,   1, 0
            ])
        );

        let ib = new gfx.IndexBuffer(
            renderer._device,
            gfx.INDEX_FMT_UINT16,
            gfx.USAGE_STATIC,
            new Uint16Array([0, 2, 1, 0, 3, 2])
        );

        _item.ia = new InputAssembler(vb, ib);
        _item.node = new cc.Node();
    },

    begin (renderer, view) {
        _allPasses.length = 0;

        let postEffect = view._postEffect;
        if (!postEffect) return;

        _allCommands = {}

        let renderers = postEffect.renderers;
        for (let i = 0; i < renderers.length; i++) {
            let renderer = renderers[i];
            if (!renderer || !renderer.enabled || !renderer.material) continue;

            let commands = renderer.commands;

            let passes = renderer.material.effect.passes;
            if (commands.length == 0) {
                for (let j = 0; j < passes.length; j++) {
                    _allPasses.push(passes[j]);
                }
            }
            else {
                for (let j = 0; j < commands.length; j++) {
                    let c = commands[j];
                    let pass = passes[c.passIndex];
                    if (!pass) continue;

                    _allCommands[_allPasses.length] = c;
                    _allPasses.push(pass);
                }
            }
        }

        if (_allPasses <= 0) return;

        this.init(renderer);

        _originFrameBuffer = view._framebuffer;
        _originTexture = getTexture(view.width, view.height);
        view._framebuffer = _originTexture._framebuffer;
    },

    end (renderer, view) {
        if (_allPasses <= 0) return;

        let device = renderer._device;

        _resolution[0] = view.width;
        _resolution[1] = view.height;

        let flip = _originTexture;
        let flop, tmp;

        for (let i = 0, l = _allPasses.length; i < l;i++) {
            let pass = _allPasses[i];
            if (!(pass instanceof Pass)) continue;

            let command = _allCommands[i];
            if (command instanceof cc.PostEffectCommand) {
                let values = command.values;
                for (let name in values) {
                    pass.setProperty(name, values[name]);
                }
            }

            _item.passes[0] = pass;

            if (i < (l-1)) {
                if (!flop) {
                    flop = getTexture(view.width, view.height);
                }
                device.setFrameBuffer(flop._framebuffer);
            }
            else {
                device.setFrameBuffer(_originFrameBuffer);
            }

            device.setUniform('cc_pe_resolution', _resolution);
            device.setTexture('cc_pe_input_texture', flip.getImpl(), renderer._allocTextureUnit());
            device.setTexture('cc_pe_origin_texture', _originTexture.getImpl(), renderer._allocTextureUnit());

            renderer._draw(_item);

            if (i+1 < l) {
                tmp = flip;
                flip = flop;
                flop = (i == 0 && _requestOriginTexture) ? getTexture(view.width, view.height) : tmp;
            }
        }

        view._framebuffer = _originFrameBuffer;

        returnTextures();
    }
}
