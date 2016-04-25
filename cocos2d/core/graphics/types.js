'use strict';

// join: bevel, round, miter
// cap : butt, round, square
var LineCap = cc.Enum({
    BUTT: 0,
    ROUND: 1,
    SQUARE: 2,
});

var LineJoin = cc.Enum({
    BEVEL: 0,
    ROUND: 1,
    MITER: 2
});

module.exports = {
    LineCap:    LineCap,
    LineJoin:   LineJoin
};
