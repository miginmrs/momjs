(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("rxjs"), require("rxjs/internal/InnerSubscriber"), require("rxjs/internal/OuterSubscriber"), require("rxjs/internal/observable/combineLatest"), require("rxjs/internal/util/subscribeToResult"), require("rxjs/operators"));
	else if(typeof define === 'function' && define.amd)
		define(["rxjs", "rxjs/internal/InnerSubscriber", "rxjs/internal/OuterSubscriber", "rxjs/internal/observable/combineLatest", "rxjs/internal/util/subscribeToResult", "rxjs/operators"], factory);
	else if(typeof exports === 'object')
		exports["rxrmi"] = factory(require("rxjs"), require("rxjs/internal/InnerSubscriber"), require("rxjs/internal/OuterSubscriber"), require("rxjs/internal/observable/combineLatest"), require("rxjs/internal/util/subscribeToResult"), require("rxjs/operators"));
	else
		root["rxrmi"] = factory(root["rxjs"], root["rxjs"]["internal"]["InnerSubscriber"], root["rxjs"]["internal"]["OuterSubscriber"], root["rxjs"]["internal"]["observable"]["combineLatest"], root["rxjs"]["internal"]["util"]["subscribeToResult"], root["rxjs"]["operators"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE_rxjs__, __WEBPACK_EXTERNAL_MODULE_rxjs_internal_InnerSubscriber__, __WEBPACK_EXTERNAL_MODULE_rxjs_internal_OuterSubscriber__, __WEBPACK_EXTERNAL_MODULE_rxjs_internal_observable_combineLatest__, __WEBPACK_EXTERNAL_MODULE_rxjs_internal_util_subscribeToResult__, __WEBPACK_EXTERNAL_MODULE_rxjs_operators__) {
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

/***/ "./node_modules/altern-map/source/altern-map.ts":
/*!******************************************************!*\
  !*** ./node_modules/altern-map/source/altern-map.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.alternMap = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const OuterSubscriber_1 = __webpack_require__(/*! rxjs/internal/OuterSubscriber */ "rxjs/internal/OuterSubscriber");
const InnerSubscriber_1 = __webpack_require__(/*! rxjs/internal/InnerSubscriber */ "rxjs/internal/InnerSubscriber");
const subscribeToResult_1 = __webpack_require__(/*! rxjs/internal/util/subscribeToResult */ "rxjs/internal/util/subscribeToResult");
/* tslint:enable:max-line-length */
/**
 *
 * Same as switchMap except that, unlike switchMap, alternMap will unsubscribe from its previous inner Observable only after subscribing to the new inner Observable
 *
 * @see {@link switchMap}
 * @see {@link mergeMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 * @return {Observable} An Observable that emits the result of applying the
 * projection function (and the optional deprecated `resultSelector`) to each item
 * emitted by the source Observable and taking only the values from the most recently
 * projected inner Observable.
 * @method alternMap
 * @owner Observable
 */
function alternMap(project, options, resultSelector) {
    if (typeof resultSelector === 'function') {
        return (source) => source.pipe(alternMap((a, i) => rxjs_1.from(project(a, i)).pipe(operators_1.map((b, ii) => resultSelector(a, b, i, ii))), options));
    }
    return (source) => source.lift(new AlternMapOperator(project, options || {}));
}
exports.alternMap = alternMap;
class AlternMapOperator {
    constructor(project, options) {
        this.project = project;
        this.options = options;
    }
    call(subscriber, source) {
        return source.subscribe(new AlternMapSubscriber(subscriber, this.project, this.options));
    }
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class AlternMapSubscriber extends OuterSubscriber_1.OuterSubscriber {
    constructor(destination, project, options) {
        super(destination);
        this.project = project;
        this.options = options;
        this.index = 0;
    }
    _next(value) {
        let result;
        const index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (error) {
            this.destination.error(error);
            return;
        }
        this._innerSub(result, value, index);
    }
    _innerSub(result, value, index) {
        const innerSubscription = this.innerSubscription;
        const innerSubscriber = new InnerSubscriber_1.InnerSubscriber(this, value, index);
        const destination = this.destination;
        destination.add(innerSubscriber);
        this.innerSubscription = subscribeToResult_1.subscribeToResult(this, result, undefined, undefined, innerSubscriber);
        // The returned subscription will usually be the subscriber that was
        // passed. However, interop subscribers will be wrapped and for
        // unsubscriptions to chain correctly, the wrapper needs to be added, too.
        if (this.innerSubscription !== innerSubscriber) {
            destination.add(this.innerSubscription);
        }
        if (innerSubscription) {
            innerSubscription.unsubscribe();
        }
    }
    _complete() {
        const { innerSubscription } = this;
        if (!innerSubscription || innerSubscription.closed || this.options.completeWithSource) {
            super._complete();
        }
        this.unsubscribe();
    }
    _unsubscribe() {
        this.innerSubscription = null;
    }
    notifyComplete(innerSub) {
        const destination = this.destination;
        destination.remove(innerSub);
        this.innerSubscription = null;
        if (this.isStopped || this.options.completeWithInner) {
            super._complete();
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    }
}


/***/ }),

/***/ "./node_modules/altern-map/source/index.ts":
/*!*************************************************!*\
  !*** ./node_modules/altern-map/source/index.ts ***!
  \*************************************************/
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./altern-map */ "./node_modules/altern-map/source/altern-map.ts"), exports);


/***/ }),

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

/***/ "./node_modules/dependent-type/source/index.ts":
/*!*****************************************************!*\
  !*** ./node_modules/dependent-type/source/index.ts ***!
  \*****************************************************/
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
exports.map = __importStar(__webpack_require__(/*! ./map */ "./node_modules/dependent-type/source/map.ts"));


/***/ }),

/***/ "./node_modules/dependent-type/source/map.ts":
/*!***************************************************!*\
  !*** ./node_modules/dependent-type/source/map.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncDepMap = exports.depMap = exports.conf = void 0;
exports.conf = { Promise };
exports.depMap = (arr, p) => {
    const r = [];
    arr.forEach((v, i) => r[i] = p(v, i));
    return r;
};
exports.asyncDepMap = (arr, p, Promise = exports.conf.Promise) => {
    const r = [];
    return Promise.all(arr.map((v, i) => Promise.resolve(p(v, i)).then(x => r[i] = x))).then(() => r);
};


/***/ }),

/***/ "./node_modules/rx-async/source/async-map.ts":
/*!***************************************************!*\
  !*** ./node_modules/rx-async/source/async-map.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateMap = exports.asyncMap = exports.iterate = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const linked_list_1 = __webpack_require__(/*! ./linked-list */ "./node_modules/rx-async/source/linked-list.ts");
exports.iterate = async (it, getPauser, onCancel) => {
    let cancelled = false, v = await it.next();
    if (onCancel)
        onCancel(() => {
            cancelled = true;
            it.next(true).catch(rxjs_1.noop);
        });
    while (!cancelled && !v.done) {
        const pauser = getPauser && getPauser();
        if (pauser)
            await pauser;
        else
            v = await it.next(false);
    }
    return !cancelled && v.done ? { ok: true, value: v.value } : {};
};
exports.asyncMap = (map, { handleException, wait = false, mode = 'concurrent' } = {}) => (source) => new rxjs_1.Observable(subscriber => {
    let lift = rxjs_1.Subscription.EMPTY;
    const merge = mode === 'merge', continuous = mode === 'recent';
    const list = new linked_list_1.List(), pause = !merge && !continuous, switchMode = mode === 'switch';
    const promiseMap = new WeakMap(), resolveMap = new WeakMap();
    const sourceSubscription = source.subscribe({
        next: v => {
            const prev = lift, actual = lift = new rxjs_1.Subscription(), node = list.unshift();
            promiseMap.set(node, new Promise(r => resolveMap.set(node, r)));
            actual.add(() => list.remove(node));
            const promise = map(v, node, { get closed() { return actual.closed; } }, () => pause && node.next ? promiseMap.get(node.next) : undefined, cb => actual.add(cb)).then(undefined, e => ({ ok: false, error: e }));
            actual.add(rxjs_1.from(promise).subscribe(({ ok, value, error }) => {
                if (!ok) {
                    if (error && handleException) {
                        const cancellable = handleException(error);
                        if (cancellable.ok)
                            subscriber.next(cancellable.value);
                    }
                    list.remove(node);
                    resolveMap.get(node)();
                    return prev.add(actual);
                }
                subscriber.next(value);
                if (merge)
                    prev.add(actual);
                else
                    actual.unsubscribe();
            }));
            if (switchMode)
                return prev.unsubscribe();
            else
                actual.add(prev);
        },
        error: e => subscriber.error(e),
        complete: () => lift.add(() => subscriber.complete())
    });
    const subs = wait ? new rxjs_1.Subscription() : sourceSubscription;
    if (wait)
        subs.add(sourceSubscription);
    subs.add(() => lift.unsubscribe());
    return subs;
});
exports.iterateMap = (map, config = { mode: 'concurrent' }) => exports.asyncMap((value, node, status, getPause, onCancel) => exports.iterate(map(value, node, status), getPause, onCancel), config);


/***/ }),

/***/ "./node_modules/rx-async/source/index.ts":
/*!***********************************************!*\
  !*** ./node_modules/rx-async/source/index.ts ***!
  \***********************************************/
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./async-map */ "./node_modules/rx-async/source/async-map.ts"), exports);
__exportStar(__webpack_require__(/*! ./linked-list */ "./node_modules/rx-async/source/linked-list.ts"), exports);


/***/ }),

/***/ "./node_modules/rx-async/source/linked-list.ts":
/*!*****************************************************!*\
  !*** ./node_modules/rx-async/source/linked-list.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
;
class List {
    *iterator(node = this.head) {
        while (node) {
            yield node;
            node = node.next;
        }
    }
    [Symbol.iterator]() {
        return this.iterator();
    }
    unshift(value) {
        const next = this.head;
        const node = this.head = { value, next, list: this };
        if (next)
            next.prev = this.head;
        if (!this.tail)
            this.tail = this.head;
        return node;
    }
    remove(node) {
        if (this.head === node)
            this.head = node.next;
        if (this.tail === node)
            this.tail = node.prev;
        if (node.next) {
            node.next.prev = node.prev;
            node.next = undefined;
        }
        if (node.prev) {
            node.prev.next = node.next;
            node.prev = undefined;
        }
    }
}
exports.List = List;


/***/ }),

/***/ "./source/async.ts":
/*!*************************!*\
  !*** ./source/async.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.asAsync = exports.wait = exports.runit = void 0;
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


/***/ }),

/***/ "./source/bimap.ts":
/*!*************************!*\
  !*** ./source/bimap.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.BiMap = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
class BiMap {
    constructor(watch = false) {
        this.watch = watch;
        this.byId = new Map();
        this.byObs = new Map();
        this.oldId = new WeakMap();
        this._empty = new rxjs_1.Subject();
        this.empty = new rxjs_1.Observable(subscriber => {
            if (!this.byId.size)
                subscriber.next();
            this._empty.subscribe(subscriber);
        });
    }
    get(id) { return this.byId.get(id); }
    delete(id) {
        const stored = this.byId.get(id);
        if (stored)
            this.byObs.delete(stored[0].origin);
        const res = this.byId.delete(id);
        if (this.watch && !this.byId.size)
            this._empty.next();
        return res;
    }
    set(id, value) {
        if (this.byObs.has(value[0].origin))
            throw new Error('Object already in store');
        if (this.byId.has(id))
            throw new Error('Id already used');
        this.byObs.set(value[0].origin, id);
        this.oldId.set(value[0].origin, id);
        this.byId.set(id, value);
    }
    ;
    reuseId(obs, id) {
        this.oldId.set(obs.origin, id);
    }
    ;
    finddir(obs) {
        const origin = obs.origin, id = this.byObs.get(origin);
        if (id === undefined)
            return undefined;
        const found = this.byId.get(id)[0];
        let upfound = found, upobs = obs;
        if (found === obs)
            return [id, 'exact'];
        const foundParents = new Set([upfound]), obsParents = new Set([upobs]);
        const err = new Error('Another observable with the same origin is in the store');
        while (true) {
            const done = !obsParents.add(upobs = upobs.parent) && !foundParents.add(upfound = upfound.parent);
            if (obsParents.has(upfound) || foundParents.has(upobs)) {
                if (upfound === obs)
                    return [id, 'down'];
                if (upobs === found)
                    return [id, 'up'];
                throw err;
            }
            if (done)
                throw err;
            upobs = upobs.parent;
            upfound = upfound.parent;
        }
    }
    find(obs, any = false) {
        var _a;
        return any ? this.byObs.get(obs.origin) : (_a = this.finddir(obs)) === null || _a === void 0 ? void 0 : _a[0];
    }
    ;
    usedId(obs) {
        return this.oldId.get(obs.origin);
    }
    ;
    get size() { return this.byId.size; }
    keys() { return this.byId.keys(); }
    entries() { return this.byId.entries(); }
    values() { return this.byId.values(); }
}
exports.BiMap = BiMap;


/***/ }),

/***/ "./source/handlers/array.ts":
/*!**********************************!*\
  !*** ./source/handlers/array.ts ***!
  \**********************************/
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = void 0;
const dependent_type_1 = __webpack_require__(/*! dependent-type */ "./node_modules/dependent-type/source/index.ts");
const origin = __importStar(__webpack_require__(/*! ../origin */ "./source/origin.ts"));
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


/***/ }),

/***/ "./source/handlers/common.ts":
/*!***********************************!*\
  !*** ./source/handlers/common.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/handlers/index.ts":
/*!**********************************!*\
  !*** ./source/handlers/index.ts ***!
  \**********************************/
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./common */ "./source/handlers/common.ts"), exports);
__exportStar(__webpack_require__(/*! ./array */ "./source/handlers/array.ts"), exports);
__exportStar(__webpack_require__(/*! ./json */ "./source/handlers/json.ts"), exports);
__exportStar(__webpack_require__(/*! ./local */ "./source/handlers/local.ts"), exports);


/***/ }),

/***/ "./source/handlers/json.ts":
/*!*********************************!*\
  !*** ./source/handlers/json.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
const origin = __importStar(__webpack_require__(/*! ../origin */ "./source/origin.ts"));
const deep_is_1 = __importDefault(__webpack_require__(/*! deep-is */ "./node_modules/deep-is/index.js"));
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


/***/ }),

/***/ "./source/handlers/local.ts":
/*!**********************************!*\
  !*** ./source/handlers/local.ts ***!
  \**********************************/
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.local = void 0;
const origin = __importStar(__webpack_require__(/*! ../origin */ "./source/origin.ts"));
var local;
(function (local) {
    local.Handler = () => ({
        decode: () => () => ({ args: [], data: {}, c: null, n: 1 }),
        encode: () => () => null,
        ctr: ([], data) => data,
    });
    local.create = (getHandler) => (data, ...teardownList) => new origin.Origin(getHandler, 'Local', null, { args: [], data, n: 1 }, undefined, ...teardownList);
})(local = exports.local || (exports.local = {}));


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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.altern_map = exports.rx_async = void 0;
exports.rx_async = __importStar(__webpack_require__(/*! rx-async */ "./node_modules/rx-async/source/index.ts"));
exports.altern_map = __importStar(__webpack_require__(/*! altern-map */ "./node_modules/altern-map/source/index.ts"));
exports.utils = __importStar(__webpack_require__(/*! ../utils */ "./utils/index.ts"));
__exportStar(__webpack_require__(/*! ./types/basic */ "./source/types/basic.ts"), exports);
__exportStar(__webpack_require__(/*! ./async */ "./source/async.ts"), exports);
__exportStar(__webpack_require__(/*! ./origin */ "./source/origin.ts"), exports);
__exportStar(__webpack_require__(/*! ./types/serial */ "./source/types/serial.ts"), exports);
__exportStar(__webpack_require__(/*! ./types/store */ "./source/types/store/index.ts"), exports);
__exportStar(__webpack_require__(/*! ./bimap */ "./source/bimap.ts"), exports);
__exportStar(__webpack_require__(/*! ./types/params */ "./source/types/params.ts"), exports);
__exportStar(__webpack_require__(/*! ./store */ "./source/store.ts"), exports);
__exportStar(__webpack_require__(/*! ./handlers */ "./source/handlers/index.ts"), exports);
__exportStar(__webpack_require__(/*! ./proxy */ "./source/proxy.ts"), exports);


/***/ }),

/***/ "./source/origin.ts":
/*!**************************!*\
  !*** ./source/origin.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Origin = exports.compareEntries = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const altern_map_1 = __webpack_require__(/*! altern-map */ "./node_modules/altern-map/source/index.ts");
const rx_utils_1 = __webpack_require__(/*! ../utils/rx-utils */ "./utils/rx-utils.ts");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
exports.compareEntries = ({ compareData = (x, y) => x === y, compareObs = (x, y) => x === y } = {}) => (x, y) => x.args.length === y.args.length && x.args.every((v, i) => {
    const vItem = v, yItem = y.args[i];
    if (vItem instanceof Array) {
        if (yItem instanceof Array)
            return vItem.length === yItem.length && vItem.every(x => x === yItem[i]);
        return false;
    }
    if (yItem instanceof Array)
        return false;
    return compareObs(vItem, yItem);
}) && compareData(x.data, y.data);
class Origin extends rxjs_1.Observable {
    constructor(getHandler, key, c, init, compare = exports.compareEntries(), ...teardownList) {
        super();
        this.getHandler = getHandler;
        this.key = key;
        this.c = c;
        this.origin = this;
        this.parent = this;
        const handler = this.handler = getHandler(key);
        let current = init.data;
        this.subject = new rxjs_1.BehaviorSubject(init);
        this.teardown = new rxjs_1.Subscription();
        teardownList.forEach(this.teardown.add.bind(this.teardown));
        this.source = new rxjs_1.Observable(subjectSubscriber => {
            subjectSubscriber.add(this.teardown);
            subjectSubscriber.add(() => {
                var _a;
                (_a = handler.destroy) === null || _a === void 0 ? void 0 : _a.call(handler, current);
                if (!this.subject.isStopped)
                    this.subject.unsubscribe();
                else
                    this.subject.closed = true;
            });
            this.subject.pipe(operators_1.distinctUntilChanged(compare), altern_map_1.alternMap(({ args, data }) => rx_utils_1.eagerCombineAll(args.map(args => args instanceof Array ? rx_utils_1.eagerCombineAll(args) : args)).pipe(operators_1.map(args => [args, data, c])), { completeWithInner: true, completeWithSource: true }), operators_1.tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }), operators_1.scan((old, [args, data, c]) => handler.ctr(args, current = data, c, old, this), null)).subscribe(subjectSubscriber);
        });
        this.operator = operators_1.shareReplay({ bufferSize: 1, refCount: true })(this).operator;
    }
    get destroyed() { return this.teardown.closed; }
    add(teardown) {
        return this.teardown.add(teardown);
    }
}
exports.Origin = Origin;


/***/ }),

/***/ "./source/proxy.ts":
/*!*************************!*\
  !*** ./source/proxy.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxy = exports.createCallHandler = exports.startListener = exports.msg2to1keys = exports.msg1to2keys = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const quick_promise_1 = __webpack_require__(/*! ../utils/quick-promise */ "./utils/quick-promise.ts");
exports.msg1to2keys = { call: 0, complete: 0, error: 0, end_call: 0, put: 0, unsubscribe: 0 };
exports.msg2to1keys = { call_complete: 0, call_error: 0, response_call: 0, response_id: 0, response_put: 0 };
exports.startListener = (store, from, to) => from.subscribe(function ({ channel, type, data }) {
    var _a;
    switch (type) {
        case 'put': {
            const refs = store.unserialize(JSON.parse(data));
            return to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
        }
        case 'unsubscribe':
            const ref = { id: JSON.parse(data) };
            return (_a = store.getValue(ref)[1].subscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        case 'error': {
            const { id, msg } = JSON.parse(data);
            const ref = { id };
            const obs = store.getValue(ref)[0];
            if (!obs)
                return;
            return obs.subject.error(msg);
        }
        case 'complete': {
            const ref = { id: JSON.parse(data) };
            const obs = store.getValue(ref)[0];
            if (!obs)
                return;
            return obs.subject.complete();
        }
        case 'call': {
            const json = JSON.parse(data);
            json.ref = { id: json.argId };
            const { fId, ref, opt, param } = json;
            const endCallSubs = from.pipe(operators_1.filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
                subs.unsubscribe();
            });
            const observer = {
                error: (err) => to.next({ channel, type: 'call_error', data: JSON.stringify(err) }),
                complete: () => to.next({ channel, type: 'call_complete', data: '' }),
            };
            const subs = opt.graph ? store.call(fId, param, ref, { ...opt, graph: true }).subscribe({
                ...observer, next: def => {
                    to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
                }
            }) : store.call(fId, param, ref, { ...opt, graph: false }).subscribe({
                ...observer, next: ref => {
                    to.next({ channel, type: 'response_id', data: JSON.stringify(ref.id) });
                }
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
                unsubscribe: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'unsubscribe' }),
                put: (def) => {
                    const ch = channel[0]++;
                    const promise = from.pipe(operators_1.filter(m => m.channel === ch && m.type === 'response_put'), operators_1.take(1)).toPromise(quick_promise_1.QuickPromise).then(response => {
                        return JSON.parse(response.data);
                    });
                    to.next({ channel: ch, type: 'put', data: JSON.stringify(def) });
                    return promise;
                },
                error: (ref, e) => to.next({ channel: callChannel, type: 'error', data: JSON.stringify({ id: ref.id, msg: `${e}` }) }),
                complete: ref => to.next({ channel: callChannel, type: 'complete', data: JSON.stringify(ref.id) }),
                call: (fId, param, ref, opt) => to.next({ channel: callChannel, type: 'call', data: JSON.stringify({ fId, param, argId: ref.id, opt }) }),
                subscribeToResult: cbs => from.pipe(operators_1.filter(x => x.channel === callChannel && x.type in exports.msg2to1keys)).subscribe(function ({ data, type }) {
                    if (type === 'response_id') {
                        cbs.resp_id({ id: JSON.parse(data) });
                    }
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
exports.createProxy = (store1, store2, msg1to2, msg2to1) => {
    const subscription = new rxjs_1.Subscription();
    const channel = [0];
    const callHandler = exports.createCallHandler(msg1to2, msg2to1, channel);
    subscription.add(exports.startListener(store2, msg1to2, msg2to1));
    subscription.add(store1.watch(callHandler));
    return { channel, callHandler, subscription };
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
exports.Store = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const dependent_type_1 = __webpack_require__(/*! dependent-type */ "./node_modules/dependent-type/source/index.ts");
const origin_1 = __webpack_require__(/*! ./origin */ "./source/origin.ts");
const rx_utils_1 = __webpack_require__(/*! ../utils/rx-utils */ "./utils/rx-utils.ts");
const global_1 = __webpack_require__(/*! ../utils/global */ "./utils/global.ts");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const altern_map_1 = __webpack_require__(/*! altern-map */ "./node_modules/altern-map/source/index.ts");
const rx_async_1 = __webpack_require__(/*! rx-async */ "./node_modules/rx-async/source/index.ts");
const bimap_1 = __webpack_require__(/*! ./bimap */ "./source/bimap.ts");
const { depMap } = dependent_type_1.map;
const one = BigInt(1);
class Store {
    constructor(getHandler, extra, promiseCtr, functions = null, name, prefix = '', locals = [], base = false) {
        this.getHandler = getHandler;
        this.extra = extra;
        this.promiseCtr = promiseCtr;
        this.functions = functions;
        this.name = name;
        this.prefix = prefix;
        this.base = base;
        this.next = one;
        this.pushed = new Map();
        this.pushes = new rxjs_1.Subject();
        this.changes = new rxjs_1.Observable(subscriber => {
            const map = new Map();
            const ctx = this.emptyContext;
            const watch = (obs, id) => {
                const origin = obs.origin, encoder = origin.handler.encode(ctx);
                return origin.subject.pipe(operators_1.scan((prev, v) => {
                    const c = origin.c;
                    const params = { ...v, ...('old' in prev ? { old: prev.old } : {}), c };
                    return { old: encoder(params), params };
                }, {}), operators_1.filter(({ old: v }) => v !== undefined)).subscribe(({ old: data, params }) => {
                    subscriber.next(['next', [{
                                c: origin.c, i: 0, data, id,
                                new: !('old' in (params !== null && params !== void 0 ? params : {})),
                                type: origin.key
                            }]]);
                }, err => subscriber.next(['error', { id }, err]), () => subscriber.next(['complete', { id }]));
            };
            for (const [obs, id] of this.pushed)
                map.set(obs, watch(obs, id));
            subscriber.add(this.pushes.subscribe(([obs, id, add]) => {
                if (add)
                    map.set(obs, watch(obs, id));
                else {
                    // console.log('remove', this.map.find(obs));
                    const isStopped = (obs) => {
                        const set = new Set([obs]);
                        while (!set.has(obs = obs.parent))
                            set.add(obs);
                        if (!set.has(obs.origin))
                            return false;
                        const subject = obs.origin.subject;
                        if (subject.isStopped)
                            return true;
                        return subject.value.args.some(args => args instanceof Array ? args.some(isStopped) : isStopped(args));
                    };
                    if (!isStopped(obs))
                        subscriber.next(['unsubscribe', { id }]);
                    map.get(obs).unsubscribe();
                    map.delete(obs);
                }
                ;
            }));
        });
        this.ref = (obs) => {
            const id = this.map.find(obs);
            return { id };
        };
        this.checkTypes = (v, ...args) => {
            const origin = v.origin, getHandler = this.getHandler;
            const err = () => new Error('Type Mismatch : ' + origin.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => origin.handler === getHandler(key) && origin.c === c))
                    throw err();
            }
            else {
                if (args[0].length && !args[0].some(key => origin.handler === getHandler(key)))
                    throw err();
            }
            return v;
        };
        this.getter = (r) => {
            if (!('id' in r))
                throw new Error('There is no local context');
            return this.getValue(r)[0];
        };
        this.xderef = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers);
        this.deref = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers, 0);
        this.emptyContext = {
            deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
        };
        this.callReturnRef = new WeakMap();
        this.functions = functions;
        const map = this.map = new bimap_1.BiMap(true);
        this.empty = map.empty;
        this.locals = new bimap_1.BiMap();
        for (const [obs, { id, ...opt }] of locals)
            this.locals.set(id, [obs, opt]);
    }
    subscribeToLocals($local) {
        const subs = new rxjs_1.Subscription();
        const local = $local !== null && $local !== void 0 ? $local : (this.base ? subs : undefined);
        for (const [, [obs, { local: $local }]] of this.locals.entries()) {
            subs.add(this.push(obs, { local: $local !== null && $local !== void 0 ? $local : local }).subscription);
        }
        return subs;
    }
    getNext(id) {
        if (id === undefined)
            return `${this.prefix}${this.next++}`;
        return id;
    }
    watch(callHandler) {
        const op = callHandler.handlers();
        return this.changes.subscribe(event => {
            switch (event[0]) {
                case 'next': return op.put(event[1]);
                case 'error': return op.error(event[1], event[2]);
                case 'complete': return op.complete(event[1]);
                case 'unsubscribe': return op.unsubscribe(event[1]);
            }
        });
    }
    /** inserts a new serial observable or updates a stored ObsWithOrigin using serialized data */
    _unserialize(key, ctx, models, cache, i) {
        var _a, _b, _c;
        const handler = this.getHandler(key);
        if (cache[i] !== undefined)
            return cache[i];
        const model = models[i], { id: usedId } = model;
        if (model.data === undefined)
            throw new Error('Trying to access a destructed object');
        const id = this.getNext(usedId);
        const local = (_a = this.locals.get(id)) === null || _a === void 0 ? void 0 : _a[1];
        if (local && !local.in) {
            throw new Error('Unexpected serialized observable');
        }
        const entry = handler.decode(ctx)(id, model.data, (_c = (_b = this.get(id)) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : null);
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
    /** inserts a new serial observable into the store with a givin id */
    _insert(key, entry, ctx, id, c) {
        var _a;
        const getHandler = this.getHandler, handler = getHandler(key);
        const compare = (_a = handler.compare) === null || _a === void 0 ? void 0 : _a.call(handler, ctx);
        const obs = new origin_1.Origin(getHandler, key, c, entry, compare, () => this.map.delete(id));
        this.map.set(id, [obs, {}]);
        return obs;
    }
    /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
    unserialize(getModels) {
        const session = [];
        const models = getModels instanceof Function ? getModels((i) => ({ $: i })) : getModels;
        const _push = (i) => {
            const modelsAsObject = models;
            const m = modelsAsObject[i];
            const _models = Object.assign(models, { [i]: m });
            return { ...this._unserialize(m.type, ctx, _models, session, i), m };
        };
        const getter = (r) => ('id' in r ? this.getValue(r)[0] : _push(r.$).obs);
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
                if (isNew) {
                    const attr = this.map.get(id)[1];
                    subscriptions.push(attr.subscription = obs.subscribe(() => { }));
                    attr.subscription.add(() => attr.subscription = undefined);
                }
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
    /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
    append(key, entry, c) {
        const id = this.getNext();
        const obs = this._insert(key, entry, this.emptyContext, id, c);
        const subs = this.map.get(id)[1].subscription = obs.subscribe(() => { });
        return { id, obs, subs };
    }
    /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
    push(obs, { unload, nextId, local: $local } = {}) {
        var _a, _b, _c, _d;
        const old = this.map.finddir(obs);
        const id = this.getNext((_c = (_b = (_a = old === null || old === void 0 ? void 0 : old[0]) !== null && _a !== void 0 ? _a : this.locals.find(obs, true)) !== null && _b !== void 0 ? _b : this.map.usedId(obs.origin)) !== null && _c !== void 0 ? _c : nextId === null || nextId === void 0 ? void 0 : nextId(obs));
        let wrapped = obs;
        let subscription;
        if (old === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = function () {
                temp.forEach(this.add.bind(this));
                temp.length = 0;
            };
            const asubj = obs.origin.subject.pipe(altern_map_1.alternMap(({ args, n }) => {
                const wrap = (obs) => {
                    const res = this.push(obs, { local: $local, nextId: (nextId && ((obs, pId) => nextId(obs, pId !== null && pId !== void 0 ? pId : id))) });
                    temp.push(res.subscription);
                    return res.wrapped;
                };
                const array = n === 2
                    ? args.map(arg => rx_utils_1.eagerCombineAll(arg.map(wrap)))
                    : args.map(wrap);
                const ret = rx_utils_1.eagerCombineAll(array);
                return ret;
            }, { completeWithInner: true }), operators_1.tap(clear));
            const teardown = () => {
                var _a;
                unload === null || unload === void 0 ? void 0 : unload({ id });
                this.map.delete(id);
                destroyed = true;
                const local = (_a = this.locals.get(id)) === null || _a === void 0 ? void 0 : _a[1];
                if ((!local || local.out) && this.pushed.delete(obs)) {
                    this.pushes.next([obs, id, false]);
                }
                clear.call(rxjs_1.Subscription.EMPTY);
            };
            if (($local === null || $local === void 0 ? void 0 : $local.closed) !== false) {
                wrapped = global_1.defineProperty(Object.assign(rx_utils_1.eagerCombineAll([obs, asubj]).pipe(operators_1.finalize(teardown), operators_1.map(([v]) => v), operators_1.shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
                this.map.set(id, [wrapped, {}]);
                subscription = wrapped.subscribe(() => { });
            }
            else {
                if (!$local[Store.nodeps])
                    $local.add(asubj.subscribe(() => { }));
                $local.add(teardown);
                this.map.set(id, [wrapped, {}]);
                subscription = wrapped.subscribe(() => { });
            }
            const local = (_d = this.locals.get(id)) === null || _d === void 0 ? void 0 : _d[1];
            if (!local || local.out) {
                this.pushed.set(obs, id);
                this.pushes.next([obs, id, true]);
            }
        }
        else {
            if (old[1] === 'down')
                wrapped = this.map.get(id)[0];
            subscription = wrapped.subscribe(() => { });
        }
        return { ref: { id }, wrapped, subscription };
    }
    /**
     * serialize any serial observable regardless wether its in the store
     * @param {Origin} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize(obs, opt) {
        const { isNew, push = true, ignore = [] } = opt;
        return obs.pipe(operators_1.scan((previous) => {
            const session = new bimap_1.BiMap;
            const allData = new Map();
            const subs = new rxjs_1.Subscription;
            let next = 1;
            const getter = (r) => ('id' in r ? this.map.get(r.id) : session.get(r.$))[0];
            const inMap = (arg) => this.map.find(arg) !== undefined;
            const ref = (iObs) => {
                const origin = iObs.origin, entry = iObs.origin.subject.value;
                const value = rx_utils_1.current(iObs);
                const id = this.map.find(iObs);
                if (id !== undefined && ignore.indexOf(id) !== -1)
                    return { id };
                let oldData = undefined, data;
                if (id !== undefined && previous) {
                    const [, old] = previous;
                    oldData = old.get(iObs);
                }
                const old = oldData ? { old: oldData.data } : {};
                const encode = () => origin.handler.encode(ctx)({ ...entry, c: origin.c, ...old });
                if (oldData) { //if (isHere)
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
                    const attr = { type: origin.key, value, ...data, c: origin.c, id: usedId };
                    attr.new = $ === 0 && previous === null && (isNew || !inMap(iObs));
                    const stored = session.get($);
                    if (stored)
                        stored[1] = attr;
                    else
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
    /* #endregion */
    call(fId, param, arg, opt = {}) {
        if (this.functions === null)
            throw new Error('Cannot call local functions from remote store');
        const f = this.functions[fId];
        const subs = new rxjs_1.Subscription();
        const obs = f(param, this.getValue(arg)[0], subs);
        if (opt.graph)
            return new rxjs_1.Observable(subscriber => {
                obs.then(obs => {
                    const { subscription } = this.push(obs);
                    subscription.add(subs);
                    const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
                    subscriber.add(serialized.subscribe(subscriber));
                    subscriber.add(subscription);
                });
            });
        return new rxjs_1.Observable(subscriber => {
            obs.then(obs => {
                const { subscription, ref } = this.push(obs);
                subscription.add(subs);
                subscriber.next(ref);
                subscriber.add(subscription);
            });
        });
    }
    /* #endregion */
    remote(fId, arg, param, { handlers: makeOp, serialized }, opt = {}) {
        return new rxjs_1.Observable(subscriber => {
            const op = makeOp();
            const { subscription: argSubscription, ref: refArg } = this.push(arg, opt.graph ? {
                unload: (ref) => op.unsubscribe(ref),
            } : {});
            const callSubscription = new rxjs_1.Subscription();
            const makePromise = (res) => [new this.promiseCtr(r => res = r), res];
            const refTask = makePromise();
            if (opt.graph) {
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
                const paramSubs = serializeObs.subscribe(() => { });
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
            }
            callSubscription.add(argSubscription);
            const responseSubs = op.subscribeToResult({
                resp_id: (ref) => {
                    responseSubs.add(this.getValue(ref)[0].pipe(operators_1.filter((_, index) => index === 0), operators_1.mapTo(ref)).subscribe(subscriber));
                    refTask[1](ref);
                },
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
            op.call(fId, param, refArg, opt);
            if (opt.graph)
                refTask[0].then(refReturn => {
                    const subs2 = this.getValue(refReturn)[0].subscribe(subscriber);
                    callSubscription.add(subs2);
                });
            subscriber.add(callSubscription);
        });
    }
}
exports.Store = Store;
Store.nodeps = Symbol();


/***/ }),

/***/ "./source/types/basic.ts":
/*!*******************************!*\
  !*** ./source/types/basic.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/params.ts":
/*!********************************!*\
  !*** ./source/types/params.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/serial.ts":
/*!********************************!*\
  !*** ./source/types/serial.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/store/call.ts":
/*!************************************!*\
  !*** ./source/types/store/call.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/store/definition.ts":
/*!******************************************!*\
  !*** ./source/types/store/definition.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/store/functions.ts":
/*!*****************************************!*\
  !*** ./source/types/store/functions.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/store/handler.ts":
/*!***************************************!*\
  !*** ./source/types/store/handler.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./source/types/store/index.ts":
/*!*************************************!*\
  !*** ./source/types/store/index.ts ***!
  \*************************************/
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./functions */ "./source/types/store/functions.ts"), exports);
__exportStar(__webpack_require__(/*! ./definition */ "./source/types/store/definition.ts"), exports);
__exportStar(__webpack_require__(/*! ./handler */ "./source/types/store/handler.ts"), exports);
__exportStar(__webpack_require__(/*! ./call */ "./source/types/store/call.ts"), exports);


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
exports.toSuperKey = exports.subKey = exports.keys = exports.byKey = exports.asCond = exports.toCond = void 0;
exports.toCond = (x) => x;
exports.asCond = (x) => x;
exports.byKey = (o, k) => o[k];
exports.keys = (p) => (k, o = p) => o[k];
exports.subKey = (k) => k;
exports.toSuperKey = (o) => o;


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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rx_utils = exports.QuickPromise = exports.guards = exports.defineProperty = void 0;
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
exports.current = exports.on = exports.eagerCombineAll = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const combineLatest_1 = __webpack_require__(/*! rxjs/internal/observable/combineLatest */ "rxjs/internal/observable/combineLatest");
class CompleteDestination extends rxjs_1.Subscriber {
    notifyComplete() { var _a, _b; (_b = (_a = this.destination).complete) === null || _b === void 0 ? void 0 : _b.call(_a); }
}
/** Like combineLatest but emits if the array of observables is empty
 * and completes when and only when one observable completes */
exports.eagerCombineAll = function (...args) {
    if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0)
        return rxjs_1.concat(rxjs_1.of([]), rxjs_1.NEVER);
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

/***/ "rxjs":
/*!************************************************************************************!*\
  !*** external {"root":["rxjs"],"commonjs":"rxjs","commonjs2":"rxjs","amd":"rxjs"} ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;

/***/ }),

/***/ "rxjs/internal/InnerSubscriber":
/*!********************************************************************************************************************************************************************************************!*\
  !*** external {"root":["rxjs","internal","InnerSubscriber"],"commonjs":"rxjs/internal/InnerSubscriber","commonjs2":"rxjs/internal/InnerSubscriber","amd":"rxjs/internal/InnerSubscriber"} ***!
  \********************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_internal_InnerSubscriber__;

/***/ }),

/***/ "rxjs/internal/OuterSubscriber":
/*!********************************************************************************************************************************************************************************************!*\
  !*** external {"root":["rxjs","internal","OuterSubscriber"],"commonjs":"rxjs/internal/OuterSubscriber","commonjs2":"rxjs/internal/OuterSubscriber","amd":"rxjs/internal/OuterSubscriber"} ***!
  \********************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_internal_OuterSubscriber__;

/***/ }),

/***/ "rxjs/internal/observable/combineLatest":
/*!**********************************************************************************************************************************************************************************************************************************!*\
  !*** external {"root":["rxjs","internal","observable","combineLatest"],"commonjs":"rxjs/internal/observable/combineLatest","commonjs2":"rxjs/internal/observable/combineLatest","amd":"rxjs/internal/observable/combineLatest"} ***!
  \**********************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_internal_observable_combineLatest__;

/***/ }),

/***/ "rxjs/internal/util/subscribeToResult":
/*!**************************************************************************************************************************************************************************************************************************!*\
  !*** external {"root":["rxjs","internal","util","subscribeToResult"],"commonjs":"rxjs/internal/util/subscribeToResult","commonjs2":"rxjs/internal/util/subscribeToResult","amd":"rxjs/internal/util/subscribeToResult"} ***!
  \**************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_internal_util_subscribeToResult__;

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
//# sourceMappingURL=rxrmi.deps.umd.js.map