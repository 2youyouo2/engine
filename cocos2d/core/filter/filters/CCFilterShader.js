var tempArray = [];

var Uniform = cc.Class({
    name: 'cc.Uniform',

    properties: {
        name: '',
        type: '1f',
        value: []
    },

    statics: {
        create: function (name, type, value) {
            var u = new Uniform();
            u.name = name;
            u.type = type;
            if (!Array.isArray(value) || type[type.length - 1] === 'v') {
                u.value = [value];
            }
            else {
                u.value = value.concat();
            }
            return u;
        }
    }
});

cc.Uniform = Uniform;

var FilterShader = cc.Class({
    name: 'cc.FilterShader',

    properties: {
        _uniforms: {
            default: [],
            type: Uniform
        },

        _filterType: '',

        uniforms: {
            get: function () {
                return this._uniforms;
            },
            set: function (value) {
                this._uniforms = value;
            },
            type: Uniform
        },

        filterType: {
            get: function () {
                return this._filterType;
            },
            set: function (value) {
                this._filterType = value;

                var filter = cc.filterShaders[this._filterType];
                if (!filter) return;

                this._uniforms.length = 0;
                var uniforms = filter.uniforms();
                for (var key in uniforms) {
                    this._uniforms.push( Uniform.create(key, uniforms[key].type, uniforms[key].value) );
                }
                
                this.init(true);
            },
            type: String
        },

        input: '',
        output: '',
    },

    init: function (force) {
        if (this._inited && !force) return;

        var filter = cc.filterShaders[this._filterType];
        if (!filter) return;

        var vert = filter.vert || this.vert;
        var frag = filter.frag || this.frag;

        this._filter = filter;

        // unit shader
        var shader = new cc.GLProgram();
        if (cc.sys.isNative) {
            shader.initWithString(vert.call(this), frag.call(this));
        }
        else {
            shader.initWithVertexShaderByteArray(vert.call(this), frag.call(this));    
        }
        
        shader.retain();
        shader.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
        shader.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
        shader.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
        shader.link();
        shader.updateUniforms();

        this._shader = shader;

        // init inner uniforms
        this._innerUniforms = {};

        var uniforms = this._uniforms;
        for (var i = 0 ; i < uniforms.length; i++) {
            var uniform = uniforms[i];
            
            var _uniform = {};
            _uniform.data = uniform;
            _uniform.location = shader.getUniformLocationForName(uniform.name);
            
            var funcName = 'setUniformLocationWith' + uniform.type;
            _uniform.func = shader[funcName];

            if (!_uniform.func) {
                cc.warn('Can\'t find uniform function [%s] for type [%s].', funcName, uniform.type);
            }

            this._innerUniforms[uniform.name] = _uniform;
        }

        // init resolution location
        this._resolutionLocation = shader.getUniformLocationForName('resolution');

        this._inited = true;
    },

    syncUniforms: function () {
        for (var key in this._innerUniforms) {
            var uniform = this._innerUniforms[key];
            if (uniform.func) {
                var data = uniform.data;
                var value = data.value;
                
                tempArray.length = 0;
                tempArray[0] = uniform.location;

                if (!Array.isArray(value) || data.type[data.type.length - 1] === 'v') {
                    tempArray[1] = value;
                }
                else {
                    for (var i = 0, l = value.length; i < l; i++) {
                        tempArray[i + 1] = value[i];
                    }
                }

                uniform.func.apply(this._shader, tempArray);
            }
        }
    },

    apply: function (renderer, resolution, input, output) {
        this.init();
        
        var shader = this._shader;
        if (!shader) return false;

        shader.use();

        if (this._resolutionLocation) {
            shader.setUniformLocationWith2f(this._resolutionLocation, resolution.width, resolution.height);
        }
        
        if (!cc.sys.isNative) {
            shader._updateProjectionUniform();
        }
        else {
            shader.setUniformsForBuiltins();
            // renderer.updateProjectionUniform(shader);
        }

        if (this._filter.draw) {
            this._filter.draw(this, renderer, input, output);
        }
        else {
            this.draw(renderer, input, output);
        }

        return true;
    },

    draw: function (renderer, input, output) {
        this.syncUniforms();
        renderer.drawFilter(input, output);
    },

    valid: function () {
        return !!this._shader;
    },

    vert: function () {
        return `
        attribute vec4 a_position;
        attribute vec2 a_texcoord;
        attribute vec4 a_color;

        varying vec4 v_color;
        varying vec2 v_texcoord;
        
        void main()
        {
           v_color = a_color;
           v_texcoord = a_texcoord;
           gl_Position = CC_PMatrix * a_position;
        }
        `;
    },

    frag: function () {
        return `
        #ifdef GL_ES
        precision mediump float;
        #endif

        varying vec2 v_texcoord;
        varying vec4 v_color;
        uniform float blur;

        void main(void) {
           gl_FragColor = texture2D(CC_Texture0, v_texcoord);
        }
        `;
    },

    clone: function () {
        var filter = new FilterShader();
        filter.input = this.input;
        filter.output = this.output;
        filter.uniforms = JSON.parse( JSON.stringify(this.uniforms) );
        filter.init();

        return filter;
    }
});

cc.FilterShader = module.exports = FilterShader;
