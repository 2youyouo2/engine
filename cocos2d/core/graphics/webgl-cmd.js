
// webgl render command
function WebGLRenderCmd (renderable) {
    _ccsg.Node.WebGLRenderCmd.call(this, renderable);
    this._needDraw = true;
}

WebGLRenderCmd.prototype = Object.create(_ccsg.Node.WebGLRenderCmd.prototype);
WebGLRenderCmd.prototype.constructor = WebGLRenderCmd;

WebGLRenderCmd.prototype.rendering = function () {
    var node = this._node;
    cc.gl.blendFunc(node._blendFunc.src, node._blendFunc.dst);

    var shader = node._shader;
    shader.use();
    shader._setUniformForMVPMatrixWithMat4(this._stackMatrix);

    node._render();
};

module.exports = WebGLRenderCmd;