
var BlurFilter = {
    name: 'Blur',

    uniforms: function () {
        return {
            blur: {type: '2f', value: [1,1]},
            radius: {type: '1f', value: 1}
        };
    },

    properties: function () {
        return {
            iterations: 3
        };
    },

    frag: function () {
        var frag = [
        '#ifdef GL_ES',
        'precision mediump float;',
        '#endif',
        
        'varying vec2 v_texcoord;',
        'varying vec4 v_color;',

        'uniform vec2 resolution;',
        'uniform vec2 blur;',

        // https://github.com/Jam3/glsl-fast-gaussian-blur
        'vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {',
            'vec4 color = vec4(0.0);',
            'vec2 off1 = vec2(1.3846153846) * direction;',
            'vec2 off2 = vec2(3.2307692308) * direction;',
            'color += texture2D(image, uv) * 0.2270270270;',
            'color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;',
            'color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;',
            'color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;',
            'color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;',
            'return color;',
        '}',

        'void main(void) {',
            'gl_FragColor = blur9(CC_Texture0, v_texcoord, resolution, blur);',
        '}'
        ].join('\n');

        // var radius = this.uniforms.radius.value;
        // if (radius | 0 === radius) {
        //     radius = radius + '.0';
        // }

        // var frag = [
        // '#ifdef GL_ES',
        // 'precision mediump float;',
        // '#endif',
        
        // 'varying vec2 v_texcoord;',
        // 'varying vec4 v_color;',

        // cc.sys.isNative ?
        // 'uniform float radius;' : 'const float radius = '+radius+';',

        // 'uniform vec2 resolution;',

        // 'void main(void) {',
        //     'vec4 col = vec4(0);',
        //     'vec2 unit = 1.0 / resolution.xy;',

        //     'float count = 0.0;',

        //     'for(float x = -radius; x <= radius; x ++)',
        //     '{',
        //         'for(float y = -radius; y <= radius; y ++)',
        //         '{',
        //             'float weight = (radius - abs(x)) * (radius - abs(y));',
        //             'col += texture2D(CC_Texture0, v_texcoord + vec2(x * unit.x, y * unit.y)) * weight;',
        //             'count += weight;',
        //         '}',
        //     '}',

        //     'gl_FragColor = col / count;',
        // '}',
        // ].join('\n');

        return frag;
    },

    draw: function (filter, renderer, input, output) {
        var shader = filter._shader;
        var location = filter._innerUniforms.blur.location;
        var blur = [4,4];//filter.uniforms.blur.value;
        var iterations = 3;//filter.iterations;

        var s = cc.director.getScene();
        var sx = s.scaleX;
        var sy = s.scaleY;

        var texture = renderer.getTexture();
        var flip = input;
        var flop = texture;        

        var step = 1 / iterations;
        var blurx = blur[0] * sx;
        var blury = blur[1] * sy;

        for (var i = 1; i <= iterations; i++) {
            shader.setUniformLocationWith2f(location, blurx * i * step, 0);
            renderer.drawFilter(flip, flop);

            shader.setUniformLocationWith2f(location, 0, blury * i * step);
            renderer.drawFilter(flop, flip);
        }

        shader.setUniformLocationWith2f(location, 0, 0);
        renderer.drawFilter(flip, output);

        renderer.returnTexture(texture);
    }
};

module.exports = BlurFilter;
