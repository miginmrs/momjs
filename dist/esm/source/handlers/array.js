import { map as dep_map } from 'dependent-type';
import * as origin from '../origin';
const { depMap } = dep_map;
export var array;
(function (array) {
    array.n = 1;
    array.Handler = () => ({
        decode: ({ deref }) => (_id, data) => {
            return {
                args: depMap(data, ref => deref(ref)),
                data: null, n: array.n
            };
        },
        encode: ({ ref }) => ({ args }) => {
            const encoded = depMap(args, (x) => ref(x));
            return encoded;
        },
        ctr: (x, _d, _c, old) => {
            if (old) {
                old.splice(0);
                x = Object.assign(old, x);
            }
            return x;
        },
    });
    array.create = (getHandler) => (args, ...teardownList) => new origin.Origin(getHandler, 'Array', null, { data: null, args, n: array.n }, undefined, ...teardownList);
    array.cast = (deref) => (p) => deref(p, 'Array');
})(array || (array = {}));
//# sourceMappingURL=array.js.map