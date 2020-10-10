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

/***/ "./node_modules/altern-map/dist/esm/altern-map.js":
/*!********************************************************!*\
  !*** ./node_modules/altern-map/dist/esm/altern-map.js ***!
  \********************************************************/
/*! exports provided: alternMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "alternMap", function() { return alternMap; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "rxjs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rxjs_internal_OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/internal/OuterSubscriber */ "rxjs/internal/OuterSubscriber");
/* harmony import */ var rxjs_internal_OuterSubscriber__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(rxjs_internal_OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rxjs_internal_InnerSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/internal/InnerSubscriber */ "rxjs/internal/InnerSubscriber");
/* harmony import */ var rxjs_internal_InnerSubscriber__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(rxjs_internal_InnerSubscriber__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rxjs_internal_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/internal/util/subscribeToResult */ "rxjs/internal/util/subscribeToResult");
/* harmony import */ var rxjs_internal_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(rxjs_internal_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_4__);





function alternMap(project, options, resultSelector) {
    if (typeof resultSelector === 'function') {
        return (source) => source.pipe(alternMap((a, i) => Object(rxjs__WEBPACK_IMPORTED_MODULE_0__["from"])(project(a, i)).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["map"])((b, ii) => resultSelector(a, b, i, ii))), options));
    }
    return (source) => source.lift(new AlternMapOperator(project, options || {}));
}
class AlternMapOperator {
    constructor(project, options) {
        this.project = project;
        this.options = options;
    }
    call(subscriber, source) {
        return source.subscribe(new AlternMapSubscriber(subscriber, this.project, this.options));
    }
}
class AlternMapSubscriber extends rxjs_internal_OuterSubscriber__WEBPACK_IMPORTED_MODULE_2__["OuterSubscriber"] {
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
        const innerSubscriber = new rxjs_internal_InnerSubscriber__WEBPACK_IMPORTED_MODULE_3__["InnerSubscriber"](this, value, index);
        const destination = this.destination;
        destination.add(innerSubscriber);
        this.innerSubscription = Object(rxjs_internal_util_subscribeToResult__WEBPACK_IMPORTED_MODULE_4__["subscribeToResult"])(this, result, undefined, undefined, innerSubscriber);
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
//# sourceMappingURL=altern-map.js.map

/***/ }),

/***/ "./node_modules/altern-map/dist/esm/index.js":
/*!***************************************************!*\
  !*** ./node_modules/altern-map/dist/esm/index.js ***!
  \***************************************************/
/*! exports provided: alternMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _altern_map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./altern-map */ "./node_modules/altern-map/dist/esm/altern-map.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "alternMap", function() { return _altern_map__WEBPACK_IMPORTED_MODULE_0__["alternMap"]; });


//# sourceMappingURL=index.js.map

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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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

/***/ "./node_modules/rx-async/dist/esm/async-map.js":
/*!*****************************************************!*\
  !*** ./node_modules/rx-async/dist/esm/async-map.js ***!
  \*****************************************************/
/*! exports provided: iterate, asyncMap, iterateMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iterate", function() { return iterate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asyncMap", function() { return asyncMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iterateMap", function() { return iterateMap; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "rxjs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _linked_list__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./linked-list */ "./node_modules/rx-async/dist/esm/linked-list.js");


const iterate = async (it, getPauser, onCancel) => {
    let cancelled = false, v = await it.next();
    if (onCancel)
        onCancel(() => {
            cancelled = true;
            it.next(true).catch(rxjs__WEBPACK_IMPORTED_MODULE_0__["noop"]);
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
const asyncMap = (map, { handleException, wait = false, mode = 'concurrent' } = {}) => (source) => new rxjs__WEBPACK_IMPORTED_MODULE_0__["Observable"](subscriber => {
    let lift = rxjs__WEBPACK_IMPORTED_MODULE_0__["Subscription"].EMPTY;
    const merge = mode === 'merge', continuous = mode === 'recent';
    const list = new _linked_list__WEBPACK_IMPORTED_MODULE_1__["List"](), pause = !merge && !continuous, switchMode = mode === 'switch';
    const promiseMap = new WeakMap(), resolveMap = new WeakMap();
    const sourceSubscription = source.subscribe({
        next: v => {
            const prev = lift, actual = lift = new rxjs__WEBPACK_IMPORTED_MODULE_0__["Subscription"](), node = list.unshift();
            promiseMap.set(node, new Promise(r => resolveMap.set(node, r)));
            actual.add(() => list.remove(node));
            const promise = map(v, node, { get closed() { return actual.closed; } }, () => pause && node.next ? promiseMap.get(node.next) : undefined, cb => actual.add(cb)).then(undefined, e => ({ ok: false, error: e }));
            actual.add(Object(rxjs__WEBPACK_IMPORTED_MODULE_0__["from"])(promise).subscribe(({ ok, value, error }) => {
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
    const subs = wait ? new rxjs__WEBPACK_IMPORTED_MODULE_0__["Subscription"]() : sourceSubscription;
    if (wait)
        subs.add(sourceSubscription);
    subs.add(() => lift.unsubscribe());
    return subs;
});
const iterateMap = (map, config = { mode: 'concurrent' }) => asyncMap((value, node, status, getPause, onCancel) => iterate(map(value, node, status), getPause, onCancel), config);
//# sourceMappingURL=async-map.js.map

/***/ }),

/***/ "./node_modules/rx-async/dist/esm/index.js":
/*!*************************************************!*\
  !*** ./node_modules/rx-async/dist/esm/index.js ***!
  \*************************************************/
/*! exports provided: iterate, asyncMap, iterateMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _async_map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./async-map */ "./node_modules/rx-async/dist/esm/async-map.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "iterate", function() { return _async_map__WEBPACK_IMPORTED_MODULE_0__["iterate"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "asyncMap", function() { return _async_map__WEBPACK_IMPORTED_MODULE_0__["asyncMap"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "iterateMap", function() { return _async_map__WEBPACK_IMPORTED_MODULE_0__["iterateMap"]; });


//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/rx-async/dist/esm/linked-list.js":
/*!*******************************************************!*\
  !*** ./node_modules/rx-async/dist/esm/linked-list.js ***!
  \*******************************************************/
/*! exports provided: List */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "List", function() { return List; });
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
//# sourceMappingURL=linked-list.js.map

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
const altern_map_1 = __webpack_require__(/*! altern-map */ "./node_modules/altern-map/dist/esm/index.js");
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
                return rx_utils_1.eagerCombineAll(array).pipe(operators_1.map(args => {
                    if (args[0] instanceof Array && args[0] === args[1])
                        debugger;
                    return [args, data, c];
                }));
            }, { completeWithInner: true, completeWithSource: true }), operators_1.tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }), operators_1.scan((old, [args, data, c]) => handler.ctr(args, data, c, old, this), null)).subscribe(subscriber);
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

/// <reference path="../typings/deep-is.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.wrapJson = exports.JsonHandler = exports.toArray = exports.wrapArray = exports.ArrayHandler = exports.ArrayN = void 0;
const destructable_1 = __webpack_require__(/*! ./destructable */ "./source/destructable.ts");
const dependent_type_1 = __webpack_require__(/*! dependent-type */ "./node_modules/dependent-type/source/index.ts");
const guards_1 = __webpack_require__(/*! ../utils/guards */ "./utils/guards.ts");
const deep_is_1 = __importDefault(__webpack_require__(/*! deep-is */ "./node_modules/deep-is/index.js"));
const { depMap } = dependent_type_1.map;
exports.ArrayN = 1;
exports.ArrayHandler = () => ({
    decode: ({ deref }) => (_id, data) => ({ args: data.map(ref => deref(ref)), data: null, n: exports.ArrayN }),
    encode: ({ ref }) => ({ args }) => guards_1.toCond(depMap(args, ref)),
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
__exportStar(__webpack_require__(/*! dependent-type */ "./node_modules/dependent-type/source/index.ts"), exports);
exports.rx_async = __importStar(__webpack_require__(/*! rx-async */ "./node_modules/rx-async/dist/esm/index.js"));
exports.altern_map = __importStar(__webpack_require__(/*! altern-map */ "./node_modules/altern-map/dist/esm/index.js"));
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
            const subs = opt.graph ? store.local(fId, param, ref, { ...opt, graph: true }).subscribe({
                ...observer, next: def => {
                    to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
                }
            }) : store.local(fId, param, ref, { ...opt, graph: false }).subscribe({
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
                error: (ref, e) => to.next({ channel: callChannel, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
                complete: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'complete' }),
                call: (fId, param, ref, opt) => to.next({ channel: callChannel, data: JSON.stringify({ fId, param, argId: ref.id, opt }), type: 'call' }),
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
exports.Store = exports.BiMap = exports.asAsync = exports.wait = exports.runit = void 0;
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const destructable_1 = __webpack_require__(/*! ./destructable */ "./source/destructable.ts");
const guards_1 = __webpack_require__(/*! ../utils/guards */ "./utils/guards.ts");
const dependent_type_1 = __webpack_require__(/*! dependent-type */ "./node_modules/dependent-type/source/index.ts");
const rx_utils_1 = __webpack_require__(/*! ../utils/rx-utils */ "./utils/rx-utils.ts");
const global_1 = __webpack_require__(/*! ../utils/global */ "./utils/global.ts");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const altern_map_1 = __webpack_require__(/*! altern-map */ "./node_modules/altern-map/dist/esm/index.js");
const rx_async_1 = __webpack_require__(/*! rx-async */ "./node_modules/rx-async/dist/esm/index.js");
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
    constructor(handlers, extra, promiseCtr, functions = null, name, prefix = '', locals = new Map()) {
        this.handlers = handlers;
        this.extra = extra;
        this.promiseCtr = promiseCtr;
        this.functions = functions;
        this.name = name;
        this.prefix = prefix;
        this.locals = locals;
        this.map = new BiMap();
        this.next = one;
        this.pushed = new Set();
        this.pushes = new rxjs_1.Subject();
        this.changes = new rxjs_1.Observable(subscriber => {
            const map = new Map();
            const ctx = this.emptyContext;
            const watch = (obs) => {
                const encoder = obs.handler.encode(ctx);
                return obs.subject.pipe(operators_1.scan((prev, v) => {
                    const params = { ...v, ...('old' in prev ? { old: prev.old } : {}), c: obs.c };
                    return { old: encoder(params), params };
                }, {}), operators_1.filter(({ old: v }, i) => v !== undefined)).subscribe(({ old: data, params }) => {
                    subscriber.next(['next', [{
                                c: obs.c, i: 0, data, id: this.map.find(obs),
                                new: !('old' in (params !== null && params !== void 0 ? params : {})),
                                type: obs.key
                            }]]);
                }, err => subscriber.next(['error', { id: this.map.find(obs) }, err]), () => subscriber.next(['complete', { id: this.map.find(obs) }]));
            };
            for (const obs of this.pushed)
                map.set(obs, watch(obs));
            subscriber.add(this.pushes.subscribe(([obs, add]) => {
                if (add)
                    map.set(obs, watch(obs));
                else {
                    // console.log('remove', this.map.find(obs));
                    const isStopped = (obs) => obs.subject.isStopped || obs.subject.value.args.some(args => args instanceof Array ? args.some(isStopped) : isStopped(args));
                    if (!isStopped(obs))
                        subscriber.next(['unsubscribe', { id: this.map.find(obs) }]);
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
            const err = () => new Error('Type Mismatch : ' + v.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => v.handler === guards_1.byKey(this.handlers, key) && v.c === c))
                    throw err();
            }
            else {
                const handlers = this.handlers;
                if (args[0].length && !args[0].some(key => v.handler === guards_1.byKey(handlers, key)))
                    throw err();
            }
            return v;
        };
        this.getter = (r) => {
            if (!('id' in r))
                throw new Error('There is no local context');
            return this.map.get(r.id)[0];
        };
        this.xderef = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref).origin, handlers);
        this.deref = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref).origin, handlers, 0);
        this.emptyContext = {
            deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
        };
        this.callReturnRef = new WeakMap();
        this.functions = functions;
    }
    subscribeToLocals() {
        const subs = new rxjs_1.Subscription();
        this.locals.forEach((_, obs) => subs.add(this.push(obs).subscription));
        return subs;
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
    /** inserts a new destructable or updates a stored ObsWithOrigin using serialized data */
    _unserialize(key, ctx, models, cache, i) {
        var _a, _b, _c;
        const handler = guards_1.byKey(this.handlers, key);
        if (cache[i] !== undefined)
            return cache[i];
        const model = models[i], { id: usedId } = model;
        if (model.data === undefined)
            throw new Error('Trying to access a destructed object');
        const id = this.getNext(usedId);
        const local = this.locals.get((_a = this.map.get(id)) === null || _a === void 0 ? void 0 : _a[0].origin);
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
    /** inserts a new destructable into the store with a givin id */
    _insert(key, entry, ctx, id, c) {
        var _a, _b;
        const handler = guards_1.byKey(this.handlers, key);
        const compare = (_a = handler.compare) === null || _a === void 0 ? void 0 : _a.call(handler, ctx);
        const obs = new destructable_1.Destructable(this.handlers, key, c, entry, compare, (_b = handler.destroy) === null || _b === void 0 ? void 0 : _b.call(handler, ctx)(entry.data), () => this.map.delete(id));
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
    /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
    append(key, entry, c) {
        const id = this.getNext();
        const obs = this._insert(key, entry, this.emptyContext, id, c);
        const subs = this.map.get(id)[1].subscription = obs.subscribe(() => { });
        return { id, obs, subs };
    }
    /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
    push(obs, { unload, nextId } = {}) {
        var _a, _b, _c, _d;
        const oldId = this.map.find(obs.origin);
        const id = this.getNext((_d = (_c = oldId !== null && oldId !== void 0 ? oldId : (_b = (_a = this.locals) === null || _a === void 0 ? void 0 : _a.get(obs.origin)) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : this.map.usedId(obs.origin)) !== null && _d !== void 0 ? _d : nextId === null || nextId === void 0 ? void 0 : nextId(obs));
        let wrapped = obs;
        let subscription;
        if (oldId === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = () => {
                temp.forEach(s => s.unsubscribe());
                temp.length = 0;
            };
            wrapped = global_1.defineProperty(Object.assign(rx_utils_1.eagerCombineAll([
                obs,
                obs.origin.subject.pipe(altern_map_1.alternMap(({ args, n }) => {
                    const wrap = (obs) => {
                        const res = this.push(obs, { nextId: (nextId && ((obs, pId) => nextId(obs, pId !== null && pId !== void 0 ? pId : id))) });
                        temp.push(res.subscription);
                        return res.wrapped;
                    };
                    const array = n === 2
                        ? args.map(arg => rx_utils_1.eagerCombineAll(arg.map(wrap)))
                        : args.map(wrap);
                    const ret = rx_utils_1.eagerCombineAll(array);
                    return ret;
                }, { completeWithInner: true }), operators_1.tap(clear))
            ]).pipe(operators_1.finalize(() => {
                unload === null || unload === void 0 ? void 0 : unload({ id });
                const local = this.locals.get(obs.origin);
                if (!local || local.out) {
                    this.pushed.delete(obs.origin);
                    this.pushes.next([obs.origin, false]);
                }
                clear();
                this.map.delete(id);
                destroyed = true;
            }), operators_1.map(([v]) => v), operators_1.shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
            this.map.set(id, [wrapped, {}]);
            subscription = wrapped.subscribe();
            const local = this.locals.get(obs.origin);
            if (!local || local.out) {
                this.pushed.add(obs.origin);
                this.pushes.next([obs.origin, true]);
            }
        }
        else {
            wrapped = this.map.get(id)[0];
            subscription = wrapped.subscribe();
        }
        return { ref: { id }, wrapped, subscription };
    }
    /**
     * serialize any destructable object regardless wether its in the store
     * @param {Destructable} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize(obs, opt) {
        const { isNew, push = true, ignore = [] } = opt;
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
                if (id !== undefined && ignore.indexOf(id) !== -1)
                    return { id };
                let oldData = undefined, data;
                if (id !== undefined && previous) {
                    const [, old] = previous;
                    oldData = old.get(iObs);
                }
                const old = oldData ? { old: oldData.data } : {};
                const encode = () => iObs.handler.encode(ctx)({ ...entry, c: iObs.c, ...old });
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
    /* #endregion */
    local(fId, param, arg, opt = {}) {
        if (this.functions === null)
            throw new Error('Cannot call local functions from remote store');
        const f = this.functions[fId];
        const obs = f(param, this.getValue(arg)[0]);
        if (opt.graph)
            return new rxjs_1.Observable(subscriber => {
                obs.then(obs => {
                    const { subscription } = this.push(obs);
                    const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
                    subscriber.add(serialized.subscribe(subscriber));
                    subscriber.add(subscription);
                });
            });
        return new rxjs_1.Observable(subscriber => {
            obs.then(obs => {
                const { subscription, ref } = this.push(obs);
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
                let serializeObs = serialized.get(arg.origin);
                if (!serializeObs)
                    serialized.set(arg.origin, serializeObs = this.serialize(arg.origin, {
                        isNew: true
                    }).pipe(rx_async_1.asyncMap((def) => {
                        const refsPromise = op.put(def);
                        return refsPromise.then((refs) => ({ ok: true, value: refs[0] }));
                    }), operators_1.tap({
                        error: e => op.error(refArg, e),
                        complete: () => op.complete(refArg),
                    }), operators_1.shareReplay({ refCount: true, bufferSize: 1 })));
                const paramSubs = serializeObs.subscribe();
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