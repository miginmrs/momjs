(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("altern-map"), require("dependent-type"), require("rx-async"), require("rxjs"), require("rxjs/internal/observable/combineLatest"), require("rxjs/operators"));
	else if(typeof define === 'function' && define.amd)
		define(["altern-map", "dependent-type", "rx-async", "rxjs", "rxjs/internal/observable/combineLatest", "rxjs/operators"], factory);
	else if(typeof exports === 'object')
		exports["rxrmi"] = factory(require("altern-map"), require("dependent-type"), require("rx-async"), require("rxjs"), require("rxjs/internal/observable/combineLatest"), require("rxjs/operators"));
	else
		root["rxrmi"] = factory(root["altern-map"], root["dependent-type"], root["rx-async"], root["rxjs"], root["rxjs"]["internal"]["observable"]["combineLatest"], root["rxjs"]["operators"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE_altern_map__, __WEBPACK_EXTERNAL_MODULE_dependent_type__, __WEBPACK_EXTERNAL_MODULE_rx_async__, __WEBPACK_EXTERNAL_MODULE_rxjs__, __WEBPACK_EXTERNAL_MODULE_rxjs_internal_observable_combineLatest__, __WEBPACK_EXTERNAL_MODULE_rxjs_operators__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./source/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/deep-is/index.js":
/*!***************************************!*\
  !*** ./node_modules/deep-is/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var pSlice = Array.prototype.slice;
var Object_keys = typeof Object.keys === 'function'
    ? Object.keys
    : function (obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }
;

var deepEqual = module.exports = function (actual, expected) {
  // enforce Object.is +0 !== -0
  if (actual === 0 && expected === 0) {
    return areZerosEqual(actual, expected);

  // 7.1. All identical values are equivalent, as determined by ===.
  } else if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  } else if (isNumberNaN(actual)) {
    return isNumberNaN(expected);

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function isNumberNaN(value) {
  // NaN === NaN -> false
  return typeof value == 'number' && value !== value;
}

function areZerosEqual(zeroA, zeroB) {
  // (1 / +0|0) -> Infinity, but (1 / -0) -> -Infinity and (Infinity !== -Infinity)
  return (1 / zeroA) === (1 / zeroB);
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;

  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b);
  }
  try {
    var ka = Object_keys(a),
        kb = Object_keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}


/***/ }),

/***/ "./source/destructable.ts":
/*!********************************!*\
  !*** ./source/destructable.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Destructable = exports.destructableCmp = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const altern_map_1 = __webpack_require__(/*! altern-map */ "altern-map");
const rx_utils_1 = __webpack_require__(/*! ../utils/rx-utils */ "./utils/rx-utils.ts");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const guards_1 = __webpack_require__(/*! ../utils/guards */ "./utils/guards.ts");
__webpack_require__(/*! ../utils/rx-utils */ "./utils/rx-utils.ts");
exports.destructableCmp = ({ compareData = (x, y) => x === y, compareObs = (x, y) => x === y } = {}) => (x, y) => x.args.length === y.args.length && x.args.every((v, i) => {
    const vItem = v, yItem = y.args[i];
    if (vItem instanceof Array) {
        if (yItem instanceof Array)
            return vItem.length === yItem.length && vItem.every((x, i) => x === yItem[i]);
        return false;
    }
    if (yItem instanceof Array)
        return false;
    return compareObs(vItem, yItem);
}) && compareData(x.data, y.data);
class Destructable extends rxjs_1.Observable {
    constructor(handlers, key, c, init, compare = exports.destructableCmp(), ...teardownList) {
        super();
        this.handlers = handlers;
        this.key = key;
        this.c = c;
        this.origin = this;
        this.parent = this;
        const handler = this.handler;
        this.subject = new rxjs_1.BehaviorSubject(init);
        this.destroy = new rxjs_1.Subscription(() => {
            if (!this.subject.isStopped)
                this.subject.unsubscribe();
            else
                this.subject.closed = true;
        });
        teardownList.forEach(cb => this.destroy.add(cb));
        this.source = new rxjs_1.Observable(subscriber => {
            const subs = this.subject.pipe(operators_1.distinctUntilChanged(compare), altern_map_1.alternMap(({ args, data }) => {
                const array = args.map(args => args instanceof Array ? rx_utils_1.eagerCombineAll(args) : args);
                return rx_utils_1.eagerCombineAll(array).pipe(operators_1.map(args => [args, data, c]));
            }, { completeWithInner: true, completeWithSource: true }), operators_1.tap(undefined, err => this.subject.error(err), () => this.subject.complete()), operators_1.scan((old, [args, data, c]) => handler.ctr(args, data, c, old), null)).subscribe(subscriber);
            subs.add(this.destroy);
            return subs;
        });
        this.operator = operators_1.shareReplay({ bufferSize: 1, refCount: true })(this).operator;
    }
    get destroyed() { return this.destroy.closed; }
    get handler() {
        return guards_1.byKey(this.handlers, this.key);
    }
}
exports.Destructable = Destructable;


/***/ }),

/***/ "./source/handlers.ts":
/*!****************************!*\
  !*** ./source/handlers.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.wrapJson = exports.JsonHandler = exports.JsonCtr = exports.toArray = exports.wrapArray = exports.ArrayHandler = exports.ArrayCtr = void 0;
const destructable_1 = __webpack_require__(/*! ./destructable */ "./source/destructable.ts");
const dependent_type_1 = __webpack_require__(/*! dependent-type */ "dependent-type");
const guards_1 = __webpack_require__(/*! ../utils/guards */ "./utils/guards.ts");
const deep_is_1 = __importDefault(__webpack_require__(/*! deep-is */ "./node_modules/deep-is/index.js"));
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


/***/ }),

/***/ "./source/index.ts":
/*!*************************!*\
  !*** ./source/index.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./store */ "./source/store.ts"), exports);
__exportStar(__webpack_require__(/*! ./handlers */ "./source/handlers.ts"), exports);
__exportStar(__webpack_require__(/*! ./destructable */ "./source/destructable.ts"), exports);
__exportStar(__webpack_require__(/*! ./types */ "./source/types.ts"), exports);
__exportStar(__webpack_require__(/*! ./proxy */ "./source/proxy.ts"), exports);
__exportStar(__webpack_require__(/*! dependent-type */ "dependent-type"), exports);
exports.rx_async = __importStar(__webpack_require__(/*! rx-async */ "rx-async"));
exports.altern_map = __importStar(__webpack_require__(/*! altern-map */ "altern-map"));
exports.utils = __importStar(__webpack_require__(/*! ../utils */ "./utils/index.ts"));


/***/ }),

/***/ "./source/proxy.ts":
/*!*************************!*\
  !*** ./source/proxy.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createCallHandler = exports.startListener = void 0;
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const quick_promise_1 = __webpack_require__(/*! ../utils/quick-promise */ "./utils/quick-promise.ts");
exports.startListener = (store, from, to) => from.subscribe(function ({ channel, type, data }) {
    var _a, _b, _c, _d;
    switch (type) {
        case 'put': {
            const refs = store.unserialize(JSON.parse(data));
            return to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
        }
        case 'unsubscribe':
            return (_b = (_a = store.get(JSON.parse(data))) === null || _a === void 0 ? void 0 : _a[1].subscription) === null || _b === void 0 ? void 0 : _b.unsubscribe();
        case 'error': {
            const { id, msg } = JSON.parse(data);
            const obs = (_c = store.get(id)) === null || _c === void 0 ? void 0 : _c[0];
            if (!obs)
                return;
            return obs.subject.error(msg);
        }
        case 'complete': {
            const obs = (_d = store.get(JSON.parse(data))) === null || _d === void 0 ? void 0 : _d[0];
            if (!obs)
                return;
            return obs.subject.complete();
        }
        case 'call': {
            const { fId, param, argId } = JSON.parse(data);
            const obs = store.local(fId, param, { id: argId });
            const endCallSubs = from.pipe(operators_1.filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
                subs.unsubscribe();
            });
            const subs = obs.subscribe(def => {
                to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
            }, err => {
                to.next({ channel, type: 'call_error', data: JSON.stringify(err) });
            }, () => {
                to.next({ channel, type: 'call_complete', data: '' });
            });
            subs.add(endCallSubs);
            this.add(subs);
            return;
        }
    }
    ;
});
exports.createCallHandler = (to, from, channel) => {
    return {
        serialized: new WeakMap(),
        handlers: () => {
            const callChannel = channel[0]++;
            return {
                end_call: () => to.next({ channel: callChannel, type: 'end_call', data: '' }),
                call_unsubscribe: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'unsubscribe' }),
                complete: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'complete' }),
                put: (def) => {
                    const ch = channel[0]++;
                    const promise = from.pipe(operators_1.filter(m => m.channel === ch), operators_1.take(1)).toPromise(quick_promise_1.QuickPromise).then(response => {
                        if (response.type !== 'response_put')
                            throw new Error('Unexpected put response message');
                        return JSON.parse(response.data);
                    });
                    to.next({ channel: ch, type: 'put', data: JSON.stringify(def) });
                    return promise;
                },
                call: (fId, param, ref) => to.next({ channel: callChannel, data: JSON.stringify({ fId, param, argId: ref.id }), type: 'call' }),
                error: (ref, e) => to.next({ channel: callChannel, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
                subscribeToResult: cbs => from.pipe(operators_1.filter(x => x.channel === callChannel)).subscribe(function ({ data, type }) {
                    if (type === 'response_call') {
                        cbs.resp_call(JSON.parse(data));
                    }
                    if (type === 'call_error') {
                        cbs.err_call(data).then(() => this.unsubscribe());
                        this.unsubscribe();
                    }
                    if (type === 'call_complete') {
                        cbs.comp_call().then(() => this.unsubscribe());
                    }
                })
            };
        }
    };
};


/***/ }),

/***/ "./source/store.ts":
/*!*************************!*\
  !*** ./source/store.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = exports.BiMap = exports.asAsync = exports.wait = exports.runit = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const destructable_1 = __webpack_require__(/*! ./destructable */ "./source/destructable.ts");
const guards_1 = __webpack_require__(/*! ../utils/guards */ "./utils/guards.ts");
const dependent_type_1 = __webpack_require__(/*! dependent-type */ "dependent-type");
const rx_utils_1 = __webpack_require__(/*! ../utils/rx-utils */ "./utils/rx-utils.ts");
const global_1 = __webpack_require__(/*! ../utils/global */ "./utils/global.ts");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const altern_map_1 = __webpack_require__(/*! altern-map */ "altern-map");
const rx_async_1 = __webpack_require__(/*! rx-async */ "rx-async");
const { depMap } = dependent_type_1.map;
exports.runit = (gen, promiseCtr) => {
    const runThen = (...args) => {
        const v = args.length ? gen.next(args[0]) : gen.next();
        if (v.done)
            return promiseCtr.resolve(v.value);
        return promiseCtr.resolve(v.value).then(runThen);
    };
    return runThen();
};
function* wait(x) {
    return yield x;
}
exports.wait = wait;
function asAsync(f, promiseCtr, thisArg) {
    return (...args) => exports.runit(f.call(thisArg, ...args), promiseCtr);
}
exports.asAsync = asAsync;
class BiMap {
    constructor() {
        this.byId = new Map();
        this.byObs = new Map();
        this.oldId = new WeakMap();
    }
    get(id) { return this.byId.get(id); }
    delete(id) {
        const stored = this.byId.get(id);
        if (stored)
            this.byObs.delete(stored[0].origin);
        return this.byId.delete(id);
    }
    set(id, value) {
        this.byObs.set(value[0].origin, id);
        this.oldId.set(value[0].origin, id);
        this.byId.set(id, value);
    }
    ;
    reuseId(obs, id) {
        this.oldId.set(obs, id);
    }
    ;
    find(obs) {
        return this.byObs.get(obs);
    }
    ;
    usedId(obs) {
        return this.oldId.get(obs);
    }
    ;
    get size() { return this.byId.size; }
    keys() { return this.byId.keys(); }
    entries() { return this.byId.entries(); }
    values() { return this.byId.values(); }
}
exports.BiMap = BiMap;
const one = BigInt(1);
class Store {
    constructor(handlers, extra, promiseCtr, name, prefix = '') {
        this.handlers = handlers;
        this.extra = extra;
        this.promiseCtr = promiseCtr;
        this.name = name;
        this.prefix = prefix;
        this.map = new BiMap();
        this.next = one;
        this.ref = (obs) => {
            const id = this.map.find(obs);
            return { id };
        };
        this.checkTypes = (v, ...args) => {
            const err = () => new Error('Type Mismatch : ' + v.origin.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => v.origin.handler === guards_1.byKey(this.handlers, key) && v.origin.c === c))
                    throw err();
            }
            else {
                const handlers = this.handlers;
                if (args[0].length && !args[0].some(key => v.origin.handler === guards_1.byKey(handlers, key)))
                    throw err();
            }
            return v;
        };
        this.getter = (r) => {
            if (!('id' in r))
                throw new Error('There is no local context');
            return this.map.get(r.id)[0];
        };
        this.xderef = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers);
        this.deref = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers, 0);
        this.emptyContext = {
            deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
        };
        this.functions = [];
        this.callReturnRef = new WeakMap();
    }
    getNext(id) {
        if (id === undefined)
            return `${this.prefix}${this.next++}`;
        return id;
    }
    findRef(obs) {
        const id = this.map.find(obs);
        return typeof id === 'string' ? { id } : id;
    }
    ;
    _unserialize(key, ctx, models, cache, i) {
        const handler = guards_1.byKey(this.handlers, key);
        if (cache[i] !== undefined)
            return cache[i];
        const model = models[i], { id: usedId } = model;
        if (model.data === undefined)
            throw new Error('Trying to access a destructed object');
        const id = this.getNext(usedId);
        const entry = handler.decode(ctx)(id, model.data);
        if (usedId !== undefined) {
            const stored = this.map.get(usedId);
            if (stored !== undefined) {
                const obs = stored[0].origin;
                if (obs.key !== model.type || obs.c !== model.c) {
                    throw new Error('Trying to update a wrong type');
                }
                obs.subject.next(entry);
                const res = { id: usedId, obs, subs: stored[1].subscription };
                return res;
            }
        }
        const obs = this._insert(key, entry, ctx, id, model.c);
        cache[i] = { obs, id };
        return cache[i];
    }
    _insert(key, entry, ctx, id, c) {
        var _a, _b;
        const handler = guards_1.byKey(this.handlers, key);
        const compare = (_a = handler.compare) === null || _a === void 0 ? void 0 : _a.call(handler, ctx);
        const obs = new destructable_1.Destructable(this.handlers, key, c, entry, compare, (_b = handler.destroy) === null || _b === void 0 ? void 0 : _b.call(handler, ctx)(entry.data), () => this.map.delete(id));
        this.map.set(id, [obs, {}]);
        return obs;
    }
    unserialize(getModels) {
        const session = [];
        const models = getModels instanceof Function ? getModels((i) => ({ $: i })) : getModels;
        const _push = (i) => {
            const modelsAsObject = models;
            const m = modelsAsObject[i];
            const _models = Object.assign(models, { [i]: m });
            return { ...this._unserialize(m.type, ctx, _models, session, i), m };
        };
        const getter = (r) => ('id' in r ? this.map.get(r.id)[0] : _push(r.$).obs);
        const ref = this.ref;
        const deref = this.deref(getter);
        const xderef = this.xderef(getter);
        const ctx = { deref, ref, xderef, ...this.extra };
        const subscriptions = [];
        const temp = [];
        try {
            const references = depMap(models, ({ i }, index) => {
                i = index;
                const { obs, id, subs, m } = _push(i);
                const isNew = m.new !== false;
                if (isNew && subs !== undefined)
                    throw new Error('Trying to subscribe to an already subscribed entity');
                if (isNew)
                    subscriptions.push(this.map.get(id)[1].subscription = obs.subscribe(() => { }));
                else if (!obs.subject.isStopped)
                    temp.push(obs.subscribe(() => { }));
                const ref = { id };
                return ref;
            });
            temp.forEach(subs => subs.unsubscribe());
            return references;
        }
        catch (e) {
            temp.concat(subscriptions).forEach(subs => subs.unsubscribe());
            throw e;
        }
    }
    append(key, entry, c) {
        const id = this.getNext();
        const obs = this._insert(key, entry, this.emptyContext, id, c);
        const subs = this.map.get(id)[1].subscription = obs.subscribe(() => { });
        return { id, obs, subs };
    }
    push(obs, { ids, unload } = {}) {
        var _a;
        const oldId = this.map.find(obs.origin);
        const id = this.getNext((_a = oldId !== null && oldId !== void 0 ? oldId : ids === null || ids === void 0 ? void 0 : ids.get(obs.origin)) !== null && _a !== void 0 ? _a : this.map.usedId(obs.origin));
        let wrapped = obs;
        let subscription;
        if (oldId === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = () => {
                temp.forEach(s => s.unsubscribe());
                temp.length = 0;
            };
            wrapped = global_1.defineProperty(Object.assign(rx_utils_1.eagerCombineAll([obs, obs.origin.subject.pipe(altern_map_1.alternMap(({ args, n }) => {
                    const wrap = (obs) => {
                        const res = this.push(obs, { ids });
                        temp.push(res.subscription);
                        return res.wrapped;
                    };
                    const array = n === 2
                        ? args.map(arg => rx_utils_1.eagerCombineAll(arg.map(wrap)))
                        : args.map(wrap);
                    const ret = rx_utils_1.eagerCombineAll(array);
                    return ret;
                }, { completeWithInner: true }), operators_1.tap(clear), operators_1.distinctUntilChanged((x, y) => x.length === y.length && x.every((v, i) => {
                    const w = y[i];
                    if (v instanceof Array && w instanceof Array) {
                        return v.length === w.length && v.every((u, i) => u === w[i]);
                    }
                    return v === w;
                })))]).pipe(operators_1.finalize(() => { unload === null || unload === void 0 ? void 0 : unload({ id }); clear(); this.map.delete(id); destroyed = true; }), operators_1.map(([v]) => v), operators_1.shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
            this.map.set(id, [wrapped, {}]);
            subscription = wrapped.subscribe();
        }
        else {
            wrapped = this.map.get(id)[0];
            subscription = wrapped.subscribe();
        }
        return { ref: { id }, wrapped, subscription };
    }
    serialize(obs, opt) {
        const { isNew, push = true } = opt;
        return obs.pipe(operators_1.scan((previous) => {
            const session = new BiMap;
            const allData = new Map();
            const subs = new rxjs_1.Subscription;
            let next = 1;
            const getter = (r) => ('id' in r ? this.map.get(r.id) : session.get(r.$))[0];
            const inMap = (arg) => this.map.find(arg) !== undefined;
            const ref = (iObs) => {
                const entry = iObs.subject.value;
                const value = rx_utils_1.current(iObs);
                const id = this.map.find(iObs);
                let oldData = undefined, data;
                if (id !== undefined && previous) {
                    const [, old] = previous;
                    oldData = old.get(iObs);
                }
                const old = oldData ? { old: oldData.data } : {};
                const encode = () => iObs.handler.encode(ctx)({ ...entry, c: iObs.c, ...old });
                if (oldData) {
                    data = { data: encode() };
                    if (data.data === undefined && id !== undefined) {
                        allData.set(iObs, oldData);
                        return { id };
                    }
                }
                const i = session.find(iObs);
                const $ = i !== null && i !== void 0 ? i : (iObs === obs ? 0 : next++);
                if (i === undefined) {
                    if (!data) {
                        session.set($, [iObs, null]);
                        data = { data: encode() };
                    }
                    allData.set(iObs, data);
                    let usedId = id;
                    if (usedId === undefined) {
                        if (push) {
                            const { subscription, ref } = this.push(iObs);
                            subs.add(subscription);
                            usedId = ref.id;
                        }
                        else {
                            usedId = this.map.usedId(iObs);
                        }
                    }
                    const attr = { type: iObs.key, value, ...data, c: iObs.c, id: usedId };
                    attr.new = $ === 0 && previous === null && (isNew || !inMap(iObs));
                    session.set($, [iObs, attr]);
                }
                return { $ };
            };
            const ctx = {
                deref: this.deref(getter), xderef: this.xderef(getter), ref, ...this.extra
            };
            const ret = [session, allData, ref(obs), subs];
            previous === null || previous === void 0 ? void 0 : previous[3].unsubscribe();
            return ret;
        }, null), operators_1.map(function ([session, , ref, subs]) {
            this.add(subs);
            const entries = Array(session.size).fill(0).map((_, i) => session.get(i));
            if (entries.length === 0) {
                if ('$' in ref)
                    throw new Error('Unexpected');
                return null;
            }
            return entries.map(([, definition], i) => {
                const def = { i, ...definition };
                delete def.value;
                return def;
            });
        }), operators_1.filter((x) => x !== null));
    }
    get(id) {
        return this.map.get(id);
    }
    getValue({ id }) {
        const obs = this.get(id);
        if (obs === undefined)
            throw new Error('Access to destroyed object');
        return obs;
    }
    local(fId, param, arg) {
        const obs = this.functions[fId](param, this.getValue(arg)[0]);
        const { subscription } = this.push(obs);
        const serialized = this.serialize(obs, { isNew: true });
        return new rxjs_1.Observable(subscriber => {
            subscriber.add(subscription);
            subscriber.add(serialized.subscribe(subscriber));
        });
    }
    remote() {
        return (fId, arg, param, { handlers: makeOp, serialized }) => new rxjs_1.Observable(subscriber => {
            const op = makeOp();
            const { subscription: argSubscription, ref: refArg } = this.push(arg, {
                unload: (ref) => op.call_unsubscribe(ref),
            });
            const callSubscription = new rxjs_1.Subscription();
            let serializeObs = serialized.get(arg);
            if (!serializeObs)
                serialized.set(arg, serializeObs = this.serialize(arg, {
                    isNew: true
                }).pipe(rx_async_1.asyncMap((def) => {
                    const refsPromise = op.put(def);
                    return refsPromise.then((refs) => ({ ok: true, value: refs[0] }));
                }), operators_1.tap({
                    error: e => op.error(refArg, e),
                    complete: () => op.complete(refArg),
                }), operators_1.shareReplay({ refCount: true, bufferSize: 1 })));
            const paramSubs = serializeObs.subscribe();
            const makePromise = (res) => [new this.promiseCtr(r => res = r), res];
            const refTask = makePromise();
            this.callReturnRef.set(subscriber, refTask[0]);
            callSubscription.add(() => {
                if (paramSubs.closed)
                    return;
                paramSubs.unsubscribe();
            });
            if (paramSubs.closed) {
                callSubscription.unsubscribe();
                return;
            }
            callSubscription.add(() => argSubscription.unsubscribe());
            const responseSubs = op.subscribeToResult({
                resp_call: (data) => {
                    var _a;
                    const ref = this.unserialize(data)[0];
                    responseSubs.add((_a = this.get(ref.id)) === null || _a === void 0 ? void 0 : _a[1].subscription);
                    refTask[1](ref);
                },
                err_call: (err) => refTask[0].then(ref => {
                    const obs = this.getValue(ref)[0];
                    obs.subject.error(err);
                }),
                comp_call: () => refTask[0].then(ref => {
                    const obs = this.getValue(ref)[0];
                    obs.subject.complete();
                })
            });
            callSubscription.add(() => {
                if (!responseSubs.closed)
                    op.end_call();
            });
            callSubscription.add(responseSubs);
            responseSubs.add(callSubscription);
            op.call(fId, param, refArg);
            refTask[0].then(refReturn => {
                const subs2 = this.getValue(refReturn)[0].subscribe(subscriber);
                callSubscription.add(() => subs2.unsubscribe());
            });
            subscriber.add(callSubscription);
        });
    }
}
exports.Store = Store;


/***/ }),

/***/ "./source/types.ts":
/*!*************************!*\
  !*** ./source/types.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./utils/global.ts":
/*!*************************!*\
  !*** ./utils/global.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.defineProperty = void 0;
function defineProperty(obj, prop, val) {
    return Object.defineProperty(obj, prop, val);
}
exports.defineProperty = defineProperty;


/***/ }),

/***/ "./utils/guards.ts":
/*!*************************!*\
  !*** ./utils/guards.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.subKey = exports.byKey = exports.asCond = exports.toCond = void 0;
exports.toCond = (x) => x;
exports.asCond = (x) => x;
exports.byKey = (o, k) => o[k];
exports.subKey = (k) => k;


/***/ }),

/***/ "./utils/index.ts":
/*!************************!*\
  !*** ./utils/index.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = __webpack_require__(/*! ./global */ "./utils/global.ts");
Object.defineProperty(exports, "defineProperty", { enumerable: true, get: function () { return global_1.defineProperty; } });
exports.guards = __importStar(__webpack_require__(/*! ./guards */ "./utils/guards.ts"));
var quick_promise_1 = __webpack_require__(/*! ./quick-promise */ "./utils/quick-promise.ts");
Object.defineProperty(exports, "QuickPromise", { enumerable: true, get: function () { return quick_promise_1.QuickPromise; } });
exports.rx_utils = __importStar(__webpack_require__(/*! ./rx-utils */ "./utils/rx-utils.ts"));


/***/ }),

/***/ "./utils/quick-promise.ts":
/*!********************************!*\
  !*** ./utils/quick-promise.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickPromise = void 0;
const identity = (v) => v;
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["Pending"] = 0] = "Pending";
    PromiseStatus[PromiseStatus["Resolved"] = 1] = "Resolved";
    PromiseStatus[PromiseStatus["Rejected"] = 2] = "Rejected";
    PromiseStatus[PromiseStatus["Alias"] = 3] = "Alias";
})(PromiseStatus || (PromiseStatus = {}));
class QuickPromise {
    constructor(executor) {
        this._thens = [];
        this._catchs = [];
        this._status = PromiseStatus.Pending;
        executor(valueOrPromise => {
            if (this._status !== PromiseStatus.Pending)
                return;
            if (((v) => v === null || v === void 0 ? void 0 : v.then)(valueOrPromise)) {
                this._status = PromiseStatus.Alias;
                this._promise = valueOrPromise;
                valueOrPromise.then(this._finilize(this._thens), this._finilize(this._catchs));
            }
            else {
                const value = valueOrPromise;
                this._value = value;
                this._status = PromiseStatus.Resolved;
                this._finilize(this._thens)(value);
            }
        }, e => {
            if (this._status !== PromiseStatus.Pending)
                return;
            this._error = e;
            this._status = PromiseStatus.Rejected;
            this._finilize(this._catchs)(e);
        });
    }
    _finilize(list) {
        return (value) => {
            list.forEach(h => h(value));
            this._thens = [];
            this._catchs = [];
        };
    }
    _tryRun(handler, resolve, reject) {
        return (x) => {
            try {
                const valueOrPromise = handler(x);
                if (((v) => v === null || v === void 0 ? void 0 : v.then)(valueOrPromise)) {
                    valueOrPromise.then(resolve, reject);
                }
                else {
                    const value = valueOrPromise;
                    resolve(value);
                }
            }
            catch (e) {
                reject(e);
            }
        };
    }
    then(onfulfilled, onrejected) {
        const onfulfilled2 = onfulfilled !== null && onfulfilled !== void 0 ? onfulfilled : identity;
        return new QuickPromise((res, rej) => {
            if (this._status === PromiseStatus.Pending) {
                this._thens.push(this._tryRun(onfulfilled2, res, rej));
                if (onrejected)
                    this._catchs.push(this._tryRun(onrejected, res, rej));
                else
                    this._catchs.push(rej);
            }
            else if (this._status === PromiseStatus.Alias) {
                const promise = this._promise;
                promise.then(this._tryRun(onfulfilled2, res, rej), onrejected ? this._tryRun(onrejected, res, rej) : rej);
            }
            else if (this._status === PromiseStatus.Resolved) {
                this._tryRun(onfulfilled2, res, rej)(this._value);
            }
            else {
                if (onrejected)
                    this._tryRun(onrejected, res, rej)(this._error);
                else
                    rej(this._error);
            }
        });
    }
    catch(onrejected) {
        return this.then(null, onrejected);
    }
    finally(onfinally) {
        if (!onfinally)
            return this;
        const handler = () => { try {
            onfinally();
        }
        catch (_e) { } };
        if (this._status === PromiseStatus.Alias)
            this._promise.then(handler, handler);
        else if (this._status === PromiseStatus.Pending)
            this._thens.push(handler), this._catchs.push(handler);
        else
            handler();
        return this;
    }
    static resolve(v) {
        return new QuickPromise(res => res(v));
    }
    static reject(e) {
        return new QuickPromise((_, rej) => rej(e));
    }
    static all(p) {
        const result = (p instanceof Array ? [...p] : { ...p });
        const keys = Object.keys(p).filter(k => p[k].then);
        let count = keys.length;
        return new QuickPromise((res, rej) => {
            if (!count)
                res(result);
            keys.forEach((k) => {
                const promise = p[k];
                promise.then(x => {
                    result[k] = x;
                    if (!--count)
                        res(result);
                }, rej);
            });
        });
    }
}
exports.QuickPromise = QuickPromise;


/***/ }),

/***/ "./utils/rx-utils.ts":
/*!***************************!*\
  !*** ./utils/rx-utils.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.current = exports.on = exports.eagerCombineAll = exports.EMPTY_ARR = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const combineLatest_1 = __webpack_require__(/*! rxjs/internal/observable/combineLatest */ "rxjs/internal/observable/combineLatest");
class CompleteDestination extends rxjs_1.Subscriber {
    notifyComplete() { var _a, _b; (_b = (_a = this.destination).complete) === null || _b === void 0 ? void 0 : _b.call(_a); }
}
exports.EMPTY_ARR = rxjs_1.concat(rxjs_1.of([]), rxjs_1.NEVER);
exports.eagerCombineAll = function (...args) {
    if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0)
        return exports.EMPTY_ARR;
    const obs = rxjs_1.combineLatest.apply(this, args);
    obs.operator.call = function (sink, source) {
        const subscriber = combineLatest_1.CombineLatestOperator.prototype.call(sink, source);
        subscriber.notifyComplete = CompleteDestination.prototype.notifyComplete;
    };
    return obs;
};
exports.on = ({ complete, error, next, subscribe, teardown }) => (source) => source.lift(function (source) {
    const subscriber = this;
    subscribe === null || subscribe === void 0 ? void 0 : subscribe();
    const subscription = new rxjs_1.Subscription();
    subscription.add(source.subscribe(v => {
        next === null || next === void 0 ? void 0 : next(v);
        subscriber.next(v);
    }, e => {
        error === null || error === void 0 ? void 0 : error(e);
        subscriber.error(e);
    }, () => {
        complete === null || complete === void 0 ? void 0 : complete();
        subscriber.complete();
    }));
    subscription.add(teardown);
    return subscription;
});
function current(obs, value) {
    obs.subscribe(v => value = v).unsubscribe();
    return value;
}
exports.current = current;


/***/ }),

/***/ "altern-map":
/*!************************************************************************************************************!*\
  !*** external {"root":["altern-map"],"commonjs":"altern-map","commonjs2":"altern-map","amd":"altern-map"} ***!
  \************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_altern_map__;

/***/ }),

/***/ "dependent-type":
/*!****************************************************************************************************************************!*\
  !*** external {"root":["dependent-type"],"commonjs":"dependent-type","commonjs2":"dependent-type","amd":"dependent-type"} ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_dependent_type__;

/***/ }),

/***/ "rx-async":
/*!****************************************************************************************************!*\
  !*** external {"root":["rx-async"],"commonjs":"rx-async","commonjs2":"rx-async","amd":"rx-async"} ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rx_async__;

/***/ }),

/***/ "rxjs":
/*!************************************************************************************!*\
  !*** external {"root":["rxjs"],"commonjs":"rxjs","commonjs2":"rxjs","amd":"rxjs"} ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;

/***/ }),

/***/ "rxjs/internal/observable/combineLatest":
/*!**********************************************************************************************************************************************************************************************************************************!*\
  !*** external {"root":["rxjs","internal","observable","combineLatest"],"commonjs":"rxjs/internal/observable/combineLatest","commonjs2":"rxjs/internal/observable/combineLatest","amd":"rxjs/internal/observable/combineLatest"} ***!
  \**********************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_internal_observable_combineLatest__;

/***/ }),

/***/ "rxjs/operators":
/*!******************************************************************************************************************************!*\
  !*** external {"root":["rxjs","operators"],"commonjs":"rxjs/operators","commonjs2":"rxjs/operators","amd":"rxjs/operators"} ***!
  \******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_operators__;

/***/ })

/******/ });
});
//# sourceMappingURL=rxrmi.umd.js.map