/// <reference path="../typings/deep-is.d.ts" />
import { Destructable } from './destructable';
import { map as dep_map } from 'dependent-type';
import equal from 'deep-is';
const { depMap } = dep_map;
export const ArrayN = 1;
export const ArrayHandler = () => ({
    decode: ({ deref }) => (_id, data) => {
        return {
            args: depMap(data, ref => deref(ref)),
            data: null, n: ArrayN
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
export const wrapArray = (handlers) => (args, ...teardownList) => new Destructable(handlers, 'Array', null, { data: null, args, n: ArrayN }, undefined, ...teardownList);
export const toArray = (deref) => (p) => deref(p, 'Array');
const deepUpdate = (target, source) => {
    const keys = (o) => Object.keys(o);
    const onlyTargetKeys = new Set(keys(target));
    for (const key of keys(source)) {
        onlyTargetKeys.delete(key);
        const targetItem = target[key], sourceItem = source[key];
        if (targetItem && sourceItem && typeof targetItem === 'object' && typeof sourceItem === 'object' && Array.isArray(targetItem) === Array.isArray(sourceItem)) {
            deepUpdate(targetItem, sourceItem);
        }
        else
            target[key] = sourceItem;
    }
    for (const key of onlyTargetKeys)
        delete target[key];
    return target;
};
const clone = (o) => {
    return o === null ? o : o instanceof Array ? o.map(clone) : typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clone(v)])) : o;
};
export const JsonHandler = () => ({
    decode: () => (_id, data) => ({ args: [], data, n: 1 }),
    encode: () => ({ data, old }) => old && equal(data, old) ? undefined : clone(data),
    ctr: (_, data, _c, old) => old ? deepUpdate(old, data) : data,
});
export const wrapJson = (handlers) => (data, ...teardownList) => new Destructable(handlers, 'Json', null, { args: [], data, n: 1 }, undefined, ...teardownList);
export const toJson = (deref) => (p) => deref(p, 'Json');
//# sourceMappingURL=handlers.js.map