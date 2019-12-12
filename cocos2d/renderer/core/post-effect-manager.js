
import InputAssembler from './input-assembler';
import IndexBuffer from '../gfx/index-buffer';
import VertexBuffer from '../gfx/vertex-buffer';
import gfx from '../gfx';

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

let _resolution = new Float32Array([0, 0]);

let _originFrameBuffer = null;
let _originTexture = null;

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
        let postEffect = view._postEffect;
        if (!postEffect) return;

        this.init(renderer);

        _originFrameBuffer = view._framebuffer;
        _originTexture = getTexture(view.width, view.height);
        view._framebuffer = _originTexture._framebuffer;
    },

    end (renderer, view) {
        let postEffect = view._postEffect;
        if (!postEffect) return;
        
        let device = renderer._device;

        _resolution[0] = view.width;
        _resolution[1] = view.height;

        let flip = _originTexture;
        let flop, tmp;

        _allPasses.length = 0;

        let requestOriginTexture = false;
        let materials = postEffect.materials;
        for (let i = 0; i < materials.length; i++) {
            let m = materials[i];
            if (!m) continue;

            let passes = m.effect.passes;
            for (let j = 0; j < passes.length; j++) {
                let pass = passes[j];
                if (pass._postEffect && pass._postEffect.requestOriginTexture) {
                    requestOriginTexture = true;
                }
                _allPasses.push(pass);
            }
        }

        for (let i = 0, l = _allPasses.length; i < l;i++) {
            let pass = _allPasses[i];


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
                flop = (i == 0 && requestOriginTexture) ? getTexture(view.width, view.height) : tmp;
            }
        }

        view._framebuffer = _originFrameBuffer;

        returnTextures();
    }
}
