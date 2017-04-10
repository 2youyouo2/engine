
var DotScreenFilter = {
    name: 'DotScreen',
    
    uniforms: function () {
        return {
            angle: {type: '1f', value:5},
            scale: {type: '1f', value:1}
        };
    },

    frag: function () {
        return `
        #ifdef GL_ES
        precision mediump float;
        #endif

        varying vec2 v_texcoord;
        varying vec4 v_color;

        uniform vec2 resolution;

        uniform float angle;
        uniform float scale;

        float pattern() {
           float s = sin(angle), c = cos(angle);
           vec2 tex = v_texcoord * resolution.xy;
           vec2 point = vec2(
               c * tex.x - s * tex.y,
               s * tex.x + c * tex.y
           ) * scale;
           return (sin(point.x) * sin(point.y)) * 4.0;
        }

        void main() {
           vec4 color = texture2D(CC_Texture0, v_texcoord);
           float average = (color.r + color.g + color.b) / 3.0;
           gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
        }
        `;
    }
};

module.exports = DotScreenFilter;
