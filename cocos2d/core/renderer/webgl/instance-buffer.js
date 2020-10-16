

let instanceBuffer;
let vbuf;
let bufferIdx = 0;

let instanceData = null;
let instanceFloat32Data = null;
let instanceDataDirty = false;

let resizeDirty = false;

let instanceTexture = null;
let instanceDataTexOptions = null;

let SUPPORT_FLOAT_TEXTURE = false;
let size = 64; //Texture Size, Must be an integer multiple of 4
let FixedRequestCount = size * size / 4;

let fixLength = 0;
let freeIndexBuffer = [];

function checkFloatSupport () {
    SUPPORT_FLOAT_TEXTURE = !!cc.sys.glExtension('OES_texture_float');
}

export function initFreeIndexBuffer () {
    if (fixLength === 0) {
        checkFloatSupport();
        freeIndexBuffer.length = fixLength = size * size / 4;
        for(let i = 0; i < freeIndexBuffer.length; i++ ) {
            freeIndexBuffer[i] = i;
        }
        initBuffer();
    } else if (freeIndexBuffer.length === 0) {
        resizeDataBuffer();
    }
}

function resizeDataBuffer () {
    size *= 2;
    freeIndexBuffer.length = size * size / 4 - fixLength;
    for(let i = 0; i < freeIndexBuffer.length; i++ ) {
        freeIndexBuffer[i] = i + fixLength;
    }
    fixLength = freeIndexBuffer.length + fixLength;

    // resize buffer
    let buffer = new Float32Array(size * size * 4);
    buffer.set(instanceFloat32Data);
    instanceData = instanceFloat32Data = buffer;
    if(!SUPPORT_FLOAT_TEXTURE) {
        instanceData = new Uint8Array(instanceFloat32Data.buffer);
    }

    // resizeTexture
    initTexture(SUPPORT_FLOAT_TEXTURE);
}

export function getDataIndex () {
    return freeIndexBuffer.shift();
}

export function releaseDataIndex (index) {
    freeIndexBuffer.unshift(index);
}

export const vfmtInstance = new cc.gfx.VertexFormat([
    { name: 'a_block_idx', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 1 },
])

export const vfmtDataBuffer = new cc.gfx.VertexFormat([
    { name: 'a_uv_matrix', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 4 },
    { name: 'a_pos_local', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 4 },
    { name: 'a_pos_rotate_scale', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 4 },
    { name: 'a_pos_translate', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: 'a_uv_rotate', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 1 },
    { name: 'a_texture_id', type: cc.gfx.ATTR_TYPE_FLOAT32, num: 1 },
])

export function initBuffer () {

    if (!instanceData) {
        instanceData = instanceFloat32Data = new Float32Array(size * size * 4); //w x h x 4(RGBA)
        if(!SUPPORT_FLOAT_TEXTURE) {
            instanceData = new Uint8Array(instanceFloat32Data.buffer);
        }
        initTexture(SUPPORT_FLOAT_TEXTURE);
    }
}

function initTexture (IsFloatTexture) {
    let pixelFormat = cc.Texture2D.PixelFormat.RGBA32F,
    width = size,
    height = size;
    if (!IsFloatTexture) {
        pixelFormat = cc.Texture2D.PixelFormat.RGBA8888;
        width *= 4;
    }
    let texture = instanceTexture || new cc.Texture2D();
    let NEAREST = cc.Texture2D.Filter.NEAREST;
    texture.setFilters(NEAREST, NEAREST);
    texture.initWithData(instanceData, pixelFormat, width, height);
    instanceTexture = texture;
    instanceDataTexOptions = {
        format: pixelFormat,
        width: texture.width,
        height: texture.height,
        images: []
    };
    instanceDataTexOptions.images[0] = instanceData;
    setResizeDirty(true);
}

export function getInstanceTexture () {
    return instanceTexture;
}

export function commitInstanceData () {
    if (instanceTexture) {
        instanceTexture.update(instanceDataTexOptions);
    }
}

export function getInstanceDataDirty () {
    return instanceDataDirty;
}

export function setInstanceDataDirty (value) {
    instanceDataDirty = value;
}

export function getResizeDirty () {
    return resizeDirty;
}

export function setResizeDirty (value) {
    resizeDirty = value;
}

export function getBuffer () {
    if (!instanceBuffer) {
        instanceBuffer = cc.renderer._handle.getBuffer('mesh', vfmtInstance);
        instanceBuffer.request(FixedRequestCount, 0);
        instanceBuffer.instanceOffset = 0;
        instanceBuffer.instanceStart = 0;
        
        let _originReset = instanceBuffer.reset;
        instanceBuffer.reset = function () {
            _originReset.call(this);

            this.request(FixedRequestCount, 0);
            
            this.instanceOffset = 0;
            this.instanceStart = 0;
        }
        instanceBuffer.isInstance = true;
        instanceBuffer.instanceCount = function () {
            return bufferIdx;
        }
        instanceBuffer.forwardIndiceStartToOffset = function () {
            this.uploadData();

            // this.instanceStart = this.instanceOffset;
            this.instanceStart = 0;
            this.instanceOffset = 0;

            this.switchBuffer();
            this.request(FixedRequestCount, 0);
        }

        vbuf = instanceBuffer._vData;
    }
    if ((instanceBuffer.instanceOffset + 1) === FixedRequestCount) {
        FixedRequestCount *= 2;
        instanceBuffer.request(FixedRequestCount, 0);
    }
    return instanceBuffer;
}

export function getVBuffer () {
    return instanceBuffer._vData;
}

export function getDataBuffer () {
    initBuffer ();
    return instanceData;
}

export function getFloat32DataBuffer () {
    initBuffer ();
    return instanceFloat32Data;
}