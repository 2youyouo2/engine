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

var PointFlags =  cc.Enum({
    PT_CORNER: 0x01,
    PT_LEFT: 0x02,
    PT_BEVEL: 0x04,
    PT_INNERBEVEL: 0x08,
    PT_ROUND: 0x10
});

module.exports = {
    LineCap:    LineCap,
    LineJoin:   LineJoin,
    PointFlags: PointFlags
};
