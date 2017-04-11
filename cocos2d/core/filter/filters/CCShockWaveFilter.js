
var ShockWaveFilter = {
    name: 'ShockWave',

    uniforms: function () {
        return {
            params: {type: '3f', value: [10, 0.8, 0.1]},
            center: {type: '2f', value: [0.5, 0.5]}
        };
    },

    frag: function () {
        return `
        #ifdef GL_ES
        precision mediump float;
        #endif

        varying vec2 v_texcoord;
        varying vec4 v_color;

        uniform vec3 params;
        uniform vec2 center;

        void main(void) {
            vec2 texCoord = v_texcoord;
            float dist = length(texCoord - center);
            float time = 0.1;

            if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )
            {
                float diff = (dist - time);
                float powDiff = 1.0 - pow(abs(diff*params.x), params.y);

                float diffTime = diff  * powDiff;
                vec2 diffUV = normalize(texCoord - center);
                texCoord = texCoord + (diffUV * diffTime);
            }

            gl_FragColor = texture2D(CC_Texture0, texCoord);
        }
        `;
    }
};

module.exports = ShockWaveFilter;
