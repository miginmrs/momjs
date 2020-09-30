"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.wrapJson = exports.JsonHandler = exports.JsonCtr = exports.toArray = exports.wrapArray = exports.ArrayHandler = exports.ArrayCtr = void 0;
const destructable_1 = require("./destructable");
const dependent_type_1 = require("dependent-type");
const guards_1 = require("../utils/guards");
const deep_is_1 = __importDefault(require("deep-is"));
const { depMap } = dependent_type_1.map;
exports.ArrayCtr = (x, _d, _c, old) => {
    if (old) {
        old.splice(0);
        x = Object.assign(old, x);
    }
    return x;
};
exports.ArrayHandler = () => ({
    decode: ({ deref }) => (_id, data) => ({ args: data.map(ref => deref(ref)), data: null, n: 1 }),
    encode: ({ ref }) => ({ args }) => guards_1.toCond(depMap(args, ref)),
    ctr: exports.ArrayCtr,
});
exports.wrapArray = (args, handlers, ...teardownList) => new destructable_1.Destructable(handlers, 'Array', null, { data: null, args, n: 1 }, undefined, ...teardownList);
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
exports.JsonCtr = (_, data, _c, old) => old ? deepUpdate(old, data) : data;
const clone = (o) => {
    return o === null ? o : o instanceof Array ? o.map(clone) : typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clone(v)])) : o;
};
exports.JsonHandler = () => ({
    decode: () => (_id, data) => ({ args: [], data, n: 1 }),
    encode: () => ({ data, old }) => old && deep_is_1.default(data, old) ? undefined : clone(data),
    ctr: exports.JsonCtr,
});
exports.wrapJson = (data, handlers, ...teardownList) => new destructable_1.Destructable(handlers, 'Json', null, { args: [], data, n: 1 }, undefined, ...teardownList);
exports.toJson = (deref) => (p) => deref(p, 'Json');
//# sourceMappingURL=handlers.js.map