"use strict";
/// <reference path="../typings/deep-is.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.wrapJson = exports.JsonHandler = exports.toArray = exports.wrapArray = exports.ArrayHandler = exports.ArrayN = void 0;
const destructable_1 = require("./destructable");
const dependent_type_1 = require("dependent-type");
const deep_is_1 = __importDefault(require("deep-is"));
const { depMap } = dependent_type_1.map;
exports.ArrayN = 1;
exports.ArrayHandler = () => ({
    decode: ({ deref }) => (_id, data) => {
        return {
            args: depMap(data, ref => deref(ref)),
            data: null, n: exports.ArrayN
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
exports.wrapArray = (handlers) => (args, ...teardownList) => new destructable_1.Destructable(handlers, 'Array', null, { data: null, args, n: exports.ArrayN }, undefined, ...teardownList);
exports.toArray = (deref) => (p) => deref(p, 'Array');
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
exports.JsonHandler = () => ({
    decode: () => (_id, data) => ({ args: [], data, n: 1 }),
    encode: () => ({ data, old }) => old && deep_is_1.default(data, old) ? undefined : clone(data),
    ctr: (_, data, _c, old) => old ? deepUpdate(old, data) : data,
});
exports.wrapJson = (handlers) => (data, ...teardownList) => new destructable_1.Destructable(handlers, 'Json', null, { args: [], data, n: 1 }, undefined, ...teardownList);
exports.toJson = (deref) => (p) => deref(p, 'Json');
//# sourceMappingURL=handlers.js.map