
var pool = [];
var index = 0;

function get () {
    var v = pool[index];
    if (!v) {
        v = pool[index] = cc.v2();
    }

    v.x = v.y = 0;

    index ++;

    return v;
}

function resetIndex () {
    index = 0;
}

function reset () {
    index = 0;
    pool.length = 0;
}

module.exports = {
    get: get,
    resetIndex: resetIndex,
    reset: reset
};
