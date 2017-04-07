
var PixelateFilter = {
    name: 'Pixelate',

    uniforms: function () {
        return {
            pixelSize: {type: '2f', value:[10, 10]}
        };
    },

    frag: function () {
        return [
        '#ifdef GL_ES',
        'precision mediump float;',
        '#endif',

        'varying vec2 v_texcoord;',
        'varying vec4 v_color;',

        'uniform vec2 resolution;',
        'uniform vec2 pixelSize;',

        'void main(void) {',
        '   vec2 size = resolution/pixelSize;',

        '   vec2 color = floor( ( v_texcoord * size ) ) / size + pixelSize/resolution * 0.5;',
        '   gl_FragColor = texture2D(CC_Texture0, color);',
        '}'
        ].join('\n');
    }
};

module.exports = PixelateFilter;
