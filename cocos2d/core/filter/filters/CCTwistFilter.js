
var TwistFilter = {
    name: 'Twist',

    uniforms: function () {
        return {
            radius: {type: '1f', value: 0.5},
            angle:  {type: '1f', value: 5},
            offset: {type: '2f', value: [0.5, 0.5]}
        };
    },

    frag: function () {
        return [
        '#ifdef GL_ES',
        'precision mediump float;',
        '#endif',

        'varying vec2 v_texcoord;',
        'varying vec4 v_color;',

        'uniform float radius;',
        'uniform float angle;',
        'uniform vec2 offset;',

        'void main(void) {',
        '   vec2 coord = v_texcoord - offset;',
        '   float distance = length(coord);',

        '   if (distance < radius) {',
        '       float ratio = (radius - distance) / radius;',
        '       float angleMod = ratio * ratio * angle;',
        '       float s = sin(angleMod);',
        '       float c = cos(angleMod);',
        '       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);',
        '   }',

        '   gl_FragColor = texture2D(CC_Texture0, coord+offset);',
        '}'
        ].join('\n');
    }
};

module.exports = TwistFilter;
