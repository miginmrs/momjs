"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSuperKey = exports.subKey = exports.keys = exports.byKey = exports.asCond = exports.toCond = void 0;
exports.toCond = (x) => x;
exports.asCond = (x) => x;
exports.byKey = (o, k) => o[k];
exports.keys = (p) => (k, o = p) => o[k];
exports.subKey = (k) => k;
exports.toSuperKey = (o) => o;
//# sourceMappingURL=guards.js.map