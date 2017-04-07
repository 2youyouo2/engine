
require('./CCFilterTexture.js');

var texturePool = [];

var WebGLRenderCmd = function(renderable){
    _ccsg.Node.WebGLRenderCmd.call(this, renderable);
    this._needDraw = false;

    this._beginCommand = new cc.CustomRenderCmd(this, this.onBeginDraw);
    this._endCommand = new cc.CustomRenderCmd(this, this.onEndDraw);

    this._quad = new cc.V3F_C4B_T2F_Quad();
    this._quadWebBuffer = cc._renderContext.createBuffer();

    this._matrix = new cc.math.Matrix4();
    this._matrix.identity();

    var locQuad = this._quad;

    locQuad.bl.texCoords = {u: 0, v: 0};
    locQuad.br.texCoords = {u: 1, v: 0};
    locQuad.tl.texCoords = {u: 0, v: 1};
    locQuad.tr.texCoords = {u: 1, v: 1};
};

var proto = WebGLRenderCmd.prototype = Object.create(_ccsg.Node.WebGLRenderCmd.prototype);
proto.constructor = WebGLRenderCmd;


proto.visit = function (parentCmd) {
    var node = this._node, renderer = cc.renderer;

    parentCmd = parentCmd || this.getParentRenderCmd();
    if (parentCmd) {
        this._curLevel = parentCmd._curLevel + 1;
    }
    this._propagateFlagsDown(parentCmd);

    // quick return if not visible
    if (!node._visible)
        return;

    if (isNaN(node._customZ)) {
        node._vertexZ = renderer.assignedZ;
        renderer.assignedZ += renderer.assignedZStep;
    }

    this._syncStatus(parentCmd);

    cc.renderer.pushRenderCommand(this._beginCommand);

    this.visitChildren();

    cc.renderer.pushRenderCommand(this._endCommand);
};

proto.updateState = function () {
    var locQuad = this._quad;

    var width = cc.winSize.width;
    var height = cc.winSize.height;

    locQuad.bl.vertices = {x: 0, y: 0, z: 0};
    locQuad.br.vertices = {x: width, y: 0, z: 0};
    locQuad.tl.vertices = {x: 0, y: height, z: 0};
    locQuad.tr.vertices = {x: width, y: height, z: 0};
};

proto.getTexture = function () {
    var size = cc.view.getCanvasSize();
    var width = size.width, height = size.height;
    var texture = texturePool.pop();
    
    if (!texture) {
        texture = new cc.FilterTexture(cc._renderContext, width, height);
    }
    else {
        texture.resize(width, height);
    }

    return texture;
};

proto.returnTexture = function (texture) {
    texturePool.push(texture);
};

proto.onBeginDraw = function () {
    this._beginDraw = false;

    var beginDrawCallback = this._node._beginDrawCallback;
    if (!beginDrawCallback || !beginDrawCallback()) {
        return;
    }

    this._beginDraw = true;

    var gl = cc._renderContext;

    this._oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    
    this._sourceTexture = this.getTexture();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._sourceTexture.frameBuffer);

    // save clear color
    this._oldClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);

    // BUG XXX: doesn't work with RGB565.
    gl.clearColor(0, 0, 0, 0);

    // BUG #631: To fix #631, uncomment the lines with #631
    // Warning: But it CCGrabber won't work with 2 effects at the same time
    //  glClearColor(0.0f,0.0f,0.0f,1.0f);    // #631

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

proto.onEndDraw = function () {
    var endDrawCallback = this._node._endDrawCallback;
    if (!this._beginDraw || !endDrawCallback) {
        return;
    }

    this.updateState();

    endDrawCallback();
};

proto.drawFilter = function (input, output) {
    var gl = cc._renderContext;

    gl.bindTexture(gl.TEXTURE_2D, input.texture);

    if (!output && !this._oldFBO) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._oldFBO);
    }
    else if (this._oldFBO) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._oldFBO);
    }
    else if (output) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, output.frameBuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    gl.enableVertexAttribArray(cc.macro.VERTEX_ATTRIB_POSITION);
    gl.enableVertexAttribArray(cc.macro.VERTEX_ATTRIB_COLOR);
    gl.enableVertexAttribArray(cc.macro.VERTEX_ATTRIB_TEX_COORDS);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //macro.VERTEX_ATTRIB_POSITION
    gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //macro.VERTEX_ATTRIB_COLOR
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //macro.VERTEX_ATTRIB_TEX_COORDS
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    cc.gl.bindTexture2DN(0, 0);
};

cc.FilterNode.WebGLRenderCmd = WebGLRenderCmd;
