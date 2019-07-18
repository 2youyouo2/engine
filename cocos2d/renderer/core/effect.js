// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

import config from '../config';
import Pass from '../core/pass';
import Technique from '../core/technique';
import { getInspectorProps, cloneObjArray, getInstanceCtor, enums2TypedArray } from '../types';
import enums from '../enums';
import gfx from '../gfx';

class Effect {
    /**
     * @param {Array} techniques
     */
    constructor(name, techniques, properties = {}, defines = {}, dependencies = [], buffer) {
        this._name = name;
        this._techniques = techniques;
        this._properties = properties;
        this._defines = defines;
        this._dependencies = dependencies;
        this._buffer = buffer;
    }

    clear () {
        this._techniques.length = 0;
        this._properties = {};
        this._defines = {};
    }

    setCullMode (cullMode) {
        let passes = this._techniques[0].passes;
        for (let i = 0; i < passes.length; i++) {
            passes[i].setCullMode(cullMode);
        }
    }

    setDepth (depthTest, depthWrite, depthFunc) {
        let passes = this._techniques[0].passes;
        for (let i = 0; i < passes.length; i++) {
            passes[i].setDepth(depthTest, depthWrite, depthFunc);
        }
    }

    setBlend (enabled, blendEq, blendSrc, blendDst, blendAlphaEq, blendSrcAlpha, blendDstAlpha, blendColor) { 
        let passes = this._techniques[0].passes;
        for (let j = 0; j < passes.length; j++) {
            let pass = passes[j];
            pass.setBlend(
                enabled,
                blendEq,
                blendSrc, blendDst,
                blendAlphaEq,
                blendSrcAlpha, blendDstAlpha, blendColor
            );
        }
    }

    setStencilEnabled (enabled) {
        let passes = this._techniques[0].passes;
        for (let i = 0; i < passes.length; i++) {
            passes[i].setStencilEnabled(enabled);
        }
    }

    setStencil (enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask) {
        let passes = this._techniques[0].passes;
        for (let i = 0; i < passes.length; ++i) {
            let pass = passes[i];
            pass.setStencilFront(enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
            pass.setStencilBack(enabled, stencilFunc, stencilRef, stencilMask, stencilFailOp, stencilZFailOp, stencilZPassOp, stencilWriteMask);
        }
    }

    getTechnique(stage) {
        let stageID = config.stageID(stage);
        if (stageID === -1) {
            return null;
        }

        for (let i = 0; i < this._techniques.length; ++i) {
            let tech = this._techniques[i];
            if (tech.stageIDs & stageID) {
                return tech;
            }
        }

        return null;
    }

    getProperty(name) {
        if (!this._properties[name]) {
            cc.warn(`${this._name} : Failed to get property ${name}, property not found.`);
            return null;
        }
        return this._properties[name].value;
    }

    setProperty(name, value) {
        let prop = this._properties[name];
        if (!prop) {
            cc.warn(`${this._name} : Failed to set property ${name}, property not found.`);
            return;
        }

        if (Array.isArray(value)) {
            let array = prop.value;
            if (array.length !== value.length) {
                cc.warn(`${this._name} : Failed to set property ${name}, property length not correct.`);
                return;
            }
            for (let i = 0; i < value.length; i++) {
                array[i] = value[i];
            }
        }
        else {
            if (prop.type === enums.PARAM_TEXTURE_2D) {
                if (CC_JSB) {
                    prop.value[0] = value ? value.getImpl().getHandle() : 0;
                }
                else {
                    prop.value = value ? value.getImpl() : null;
                }
            }
            else if (value.array) {
                value.array(prop.value)
            }
            else if (prop.type === enums.PARAM_FLOAT || prop.type === enums.PARAM_INT) {
                prop.value[0] = value;
            }
            else {
                prop.value = value;
                cc.warn(`effect.setProperty : unrecognized property value ${name}`);
            }
        }
    }

    updateHash(hash) {
    }

    getDefine(name) {
        let def = this._defines[name];
        if (def === undefined) {
            cc.warn(`${this._name} : Failed to get define ${name}, define not found.`);
        }

        return def;
    }

    define(name, value) {
        let def = this._defines[name];
        if (def === undefined) {
            cc.warn(`${this._name} : Failed to set define ${name}, define not found.`);
            return;
        }

        this._defines[name] = value;
    }

    extractProperties(out = {}) {
        Object.assign(out, this._properties);
        return out;
    }

    extractDefines(out = {}) {
        Object.assign(out, this._defines);
        return out;
    }

    extractDependencies(out = {}) {
        for (let i = 0; i < this._dependencies.length; ++i) {
            let dep = this._dependencies[i];
            out[dep.define] = dep.extension;
        }

        return out;
    }

    clone () {
        let buffer = new Float32Array(this._buffer);

        let defines = this.extractDefines({});
        let dependencies = this.extractDependencies({});

        let newProperties = {};
        let properties = this._properties;
        for (let name in properties) {
            let prop = properties[name];
            let newProp = newProperties[name] = Object.assign({}, prop);

            if (CC_JSB || prop.type !== enums.PARAM_TEXTURE_2D) {
                let oldValue = newProp.value;
                newProp.value = new oldValue.constructor(buffer.buffer, oldValue.byteOffset, oldValue.length);
            }
        }

        let techniques = [];
        for (let i = 0; i < this._techniques.length; i++) {
            techniques.push(this._techniques[i].clone(buffer));
        }

        return new cc.Effect(this._name, techniques, newProperties, defines, dependencies, buffer);
    }
}


let getInvolvedPrograms = function(json) {
    let programs = [], lib = cc.renderer._forward._programLib;
    json.techniques.forEach(tech => {
        tech.passes.forEach(pass => {
            programs.push(lib.getTemplate(pass.program));
        });
    });
    return programs;
};

function parseProperties(json, programs) {
    let props = {};

    // TODO: Should parse properties for each passes separately, refer to Cocos Creator 3D.
    let properties = {};
    json.techniques.forEach(tech => {
        tech.passes.forEach(pass => {
            Object.assign(properties, pass.properties);
        })
    });

    for (let prop in properties) {
        let propInfo = properties[prop], uniformInfo;
        for (let i = 0; i < programs.length; i++) {
            uniformInfo = programs[i].uniforms.find(u => u.name === prop);
            if (uniformInfo) break;
        }
        // the property is not defined in all the shaders used in techs
        // myabe defined a not used property
        if (!uniformInfo) {
            cc.warn(`${json.name} : illegal property: ${prop}`);
            continue;
        }

        props[prop] = Object.assign({}, propInfo);
    }
    return props;
};

Effect.parseTechniques = function (effect, arrayBuffer, byteOffset) {
    let techNum = effect.techniques.length;
    let techniques = new Array(techNum);
    for (let j = 0; j < techNum; ++j) {
        let tech = effect.techniques[j];
        if (!tech.stages) {
            tech.stages = ['opaque']
        }
        let passNum = tech.passes.length;
        let passes = new Array(passNum);
        for (let k = 0; k < passNum; ++k) {
            let pass = tech.passes[k];
            passes[k] = new Pass(pass.program, arrayBuffer, byteOffset);

            // rasterizer state
            if (pass.rasterizerState) {
                passes[k].setCullMode(pass.rasterizerState.cullMode);
            }

            // blend state
            let blendState = pass.blendState && pass.blendState.targets[0];
            if (blendState) {
                passes[k].setBlend(blendState.blend, blendState.blendEq, blendState.blendSrc,
                    blendState.blendDst, blendState.blendAlphaEq, blendState.blendSrcAlpha, blendState.blendDstAlpha, blendState.blendColor);
            }

            // depth stencil state
            let depthStencilState = pass.depthStencilState;
            if (depthStencilState) {
                passes[k].setDepth(depthStencilState.depthTest, depthStencilState.depthWrite, depthStencilState.depthFunc);
            passes[k].setStencilFront(depthStencilState.stencilTest, depthStencilState.stencilFuncFront, depthStencilState.stencilRefFront, depthStencilState.stencilMaskFront,
                depthStencilState.stencilFailOpFront, depthStencilState.stencilZFailOpFront, depthStencilState.stencilZPassOpFront, depthStencilState.stencilWriteMaskFront);
            passes[k].setStencilBack(depthStencilState.stencilTest, depthStencilState.stencilFuncBack, depthStencilState.stencilRefBack, depthStencilState.stencilMaskBack,
                depthStencilState.stencilFailOpBack, depthStencilState.stencilZFailOpBack, depthStencilState.stencilZPassOpBack, depthStencilState.stencilWriteMaskBack);
            }

            byteOffset += Pass.ELEMENT_COUNT * 4;
        }
        techniques[j] = new Technique(tech.stages, passes, tech.layer);
    }

    return techniques;
};

Effect.parseEffect = function (asset) {
    let totalArrayCount = 0;

    // calculate pass array count
    for (let i = 0; i < asset.techniques.length; i++) {
        let passes = asset.techniques[i].passes;
        totalArrayCount += passes.length * Pass.ELEMENT_COUNT;
    }
    
    // calculate uniform array count and offset
    let uniforms = {}, defines = {};

    let programs = getInvolvedPrograms(asset);
    programs.forEach(p => {
        // uniforms
        p.uniforms.forEach(u => {
            let uniform = uniforms[u.name] = Object.assign({}, u);

            let defaultArray = enums2TypedArray[u.type];
            uniform.value = defaultArray;

            uniform.byteOffset = totalArrayCount * 4;
            totalArrayCount += defaultArray.length;
        });

        p.defines.forEach(d => {
            defines[d.name] = getInstanceCtor(d.type)();
        })
    });

    // init total typed array buffer
    let buffer = new Float32Array(totalArrayCount);

    // parse technique
    let techniques = Effect.parseTechniques(asset, buffer.buffer, 0);

    let props = parseProperties(asset, programs);
    for (let name in uniforms) {
        let uniform = uniforms[name];
        var oldValue = uniform.value;
        if (uniform.type === enums.PARAM_TEXTURE_2D) {
            if (!CC_JSB) {
                uniform.value = null;
            }
            else {
                uniform.value = new Uint32Array(buffer.buffer, uniform.byteOffset, oldValue.length);
                uniform.value[0] = 0;
            }
        }
        else {
            uniform.value = new Float32Array(buffer.buffer, uniform.byteOffset, oldValue.length);
            if (props[name]) {
                uniform.value.set(props[name].value);
            }
            else {
                uniform.value.set(oldValue);
            }
        }
    }

    // extensions
    let extensions = programs.reduce((acc, cur) => acc = acc.concat(cur.extensions), []);
    extensions = cloneObjArray(extensions);

    return new cc.Effect(asset.name, techniques, uniforms, defines, extensions, buffer);
};

if (CC_EDITOR) {
    Effect.parseForInspector = function(json) {
        let programs = getInvolvedPrograms(json);
        let props = parseProperties(json, programs), defines = {};

        for (let pn in programs) {
            programs[pn].uniforms.forEach(u => {
                let prop = props[u.name];
                if (!prop) return;
                prop.defines = u.defines;
            });
            programs[pn].defines.forEach(define => {
                defines[define.name] = getInspectorProps(define);
            });
        }
        
        for (let name in props) {
            props[name] = getInspectorProps(props[name]);
        }

        return { props, defines };
    };
}

export default Effect;
cc.Effect = Effect;
cc.Effect.extension = {
    PARAM_TEXTURE_2D: enums.PARAM_TEXTURE_2D,
    cloneObjArray: cloneObjArray, 
    getInstanceCtor: getInstanceCtor
}
