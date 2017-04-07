
if (!cc.sys.isNative) {
    require('./CCFilterNode.js');
    require('./CCFilterNodeWebGlCmd.js');    
}
// else {
//     cc.FilterNode = _ccsg.Node;
// }

require('./filters');

require('./CCFilter.js');
