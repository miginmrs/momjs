import { Destructable } from './destructable';
import { map as dep_map } from 'dependent-type';
import { toCond } from '../utils/guards';
import equal from 'deep-is';
const { depMap } = dep_map;
export const ArrayCtr = (x, _d, _c, old) => {
    if (old) {
        old.splice(0);
        x = Object.assign(old, x);
    }
    return x;
};
export const ArrayHandler = () => ({
    decode: ({ deref }) => (_id, data) => ({ args: data.map(ref => deref(ref)), data: null, n: 1 }),
    encode: ({ ref }) => ({ args }) => toCond(depMap(args, ref)),
    ctr: ArrayCtr,
});
export const wrapArray = (args, handlers, ...teardownList) => new Destructable(handlers, 'Array', null, { data: null, args, n: 1 }, undefined, ...teardownList);
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
export const JsonCtr = (_, data, _c, old) => old ? deepUpdate(old, data) : data;
const clone = (o) => {
    return o === null ? o : o instanceof Array ? o.map(clone) : typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clone(v)])) : o;
};
export const JsonHandler = () => ({
    decode: () => (_id, data) => ({ args: [], data, n: 1 }),
    encode: () => ({ data, old }) => old && equal(data, old) ? undefined : clone(data),
    ctr: JsonCtr,
});
export const wrapJson = (data, handlers, ...teardownList) => new Destructable(handlers, 'Json', null, { args: [], data, n: 1 }, undefined, ...teardownList);
export const toJson = (deref) => (p) => deref(p, 'Json');
//# sourceMappingURL=handlers.js.map