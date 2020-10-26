"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = void 0;
const dependent_type_1 = require("dependent-type");
const origin = __importStar(require("../origin"));
const { depMap } = dependent_type_1.map;
var array;
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
})(array = exports.array || (exports.array = {}));
//# sourceMappingURL=array.js.map