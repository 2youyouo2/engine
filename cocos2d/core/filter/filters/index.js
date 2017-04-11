
require('./CCFilterShader.js');

cc.filterShaders = {};

[
    require('./CCBlurFilter.js'),
    require('./CCGrayFilter.js'),
    require('./CCDotScreenFilter.js'),
    require('./CCPixelateFilter.js'),
    require('./CCTwistFilter.js'),
    require('./CCShockWaveFilter.js'),
].forEach(function (filterDefine) {
    cc.filterShaders[filterDefine.name] = filterDefine;
});