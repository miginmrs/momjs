"use strict";
/// <reference path="../../typings/deep-is.d.ts" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = void 0;
const origin = __importStar(require("../origin"));
const deep_is_1 = __importDefault(require("deep-is"));
var json;
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
        encode: () => ({ data, old }) => old && deep_is_1.default(data, old) ? undefined : clone(data),
        ctr: (_, data, _c, old) => old ? deepUpdate(old, data) : data,
    });
    json.create = (getHandler) => (data, ...teardownList) => new origin.Origin(getHandler, 'Json', null, { args: [], data, n: json.n }, undefined, ...teardownList);
    json.cast = (deref) => (p) => deref(p, 'Json');
})(json = exports.json || (exports.json = {}));
//# sourceMappingURL=json.js.map