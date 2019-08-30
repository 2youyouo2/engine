
import Vec2 from '../../value-types/vec2';

export default function TRSPosition (trs) {
    this._trs = trs;
}

cc.js.extend(TRSPosition, Vec2);


let p = TRSPosition.prototype;
cc.js.getset(p, 'x', function () {
    return this._trs[0];
})
cc.js.getset(p, 'y', function () {
    return this._trs[1];
})
cc.js.getset(p, 'z', function () {
    return this._trs[2];
})
