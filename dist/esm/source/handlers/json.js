/// <reference path="../../typings/deep-is.d.ts" />
import * as origin from '../origin';
import equal from 'deep-is';
export var json;
(function (json) {
    json.n = 1;
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
    json.Handler = () => ({
        decode: () => (_id, data) => ({ args: [], data, n: json.n }),
        encode: () => ({ data, old }) => old && equal(data, old) ? undefined : clone(data),
        ctr: (_, data, _c, old) => old ? deepUpdate(old, data) : data,
    });
    json.create = (getHandler) => (data, ...teardownList) => new origin.Origin(getHandler, 'Json', null, { args: [], data, n: json.n }, undefined, ...teardownList);
    json.cast = (deref) => (p) => deref(p, 'Json');
})(json || (json = {}));
//# sourceMappingURL=json.js.map