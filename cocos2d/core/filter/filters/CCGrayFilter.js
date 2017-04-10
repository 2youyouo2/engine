
var GrayFilter = {
    name: 'Gray',

    uniforms: function () {
        return {
            gray: {type: '1f', value: 1}
        };
    },

    frag: function () {
        return `
        #ifdef GL_ES
        precision mediump float;
        #endif

        varying vec2       v_texcoord;
        varying vec4       v_color;
        uniform float      gray;

        void main(void) {
            gl_FragColor = texture2D(CC_Texture0, v_texcoord);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126 * gl_FragColor.r + 0.7152 * gl_FragColor.g + 0.0722 * gl_FragColor.b), gray);
        }
        `;
    }
};

module.exports = GrayFilter;
