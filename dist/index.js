import {createRequire} from "node:module";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = createRequire(import.meta.url);

// node_modules/event-target-shim/dist/event-target-shim.js
var require_event_target_shim = __commonJS((exports, module) => {
  var pd = function(event) {
    const retv = privateData.get(event);
    console.assert(retv != null, "'this' is expected an Event object, but got", event);
    return retv;
  };
  var setCancelFlag = function(data) {
    if (data.passiveListener != null) {
      if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error("Unable to preventDefault inside passive event listener invocation.", data.passiveListener);
      }
      return;
    }
    if (!data.event.cancelable) {
      return;
    }
    data.canceled = true;
    if (typeof data.event.preventDefault === "function") {
      data.event.preventDefault();
    }
  };
  var Event = function(eventTarget, event) {
    privateData.set(this, {
      eventTarget,
      event,
      eventPhase: 2,
      currentTarget: eventTarget,
      canceled: false,
      stopped: false,
      immediateStopped: false,
      passiveListener: null,
      timeStamp: event.timeStamp || Date.now()
    });
    Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
    const keys = Object.keys(event);
    for (let i = 0;i < keys.length; ++i) {
      const key = keys[i];
      if (!(key in this)) {
        Object.defineProperty(this, key, defineRedirectDescriptor(key));
      }
    }
  };
  var defineRedirectDescriptor = function(key) {
    return {
      get() {
        return pd(this).event[key];
      },
      set(value) {
        pd(this).event[key] = value;
      },
      configurable: true,
      enumerable: true
    };
  };
  var defineCallDescriptor = function(key) {
    return {
      value() {
        const event = pd(this).event;
        return event[key].apply(event, arguments);
      },
      configurable: true,
      enumerable: true
    };
  };
  var defineWrapper = function(BaseEvent, proto) {
    const keys = Object.keys(proto);
    if (keys.length === 0) {
      return BaseEvent;
    }
    function CustomEvent(eventTarget, event) {
      BaseEvent.call(this, eventTarget, event);
    }
    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
      constructor: { value: CustomEvent, configurable: true, writable: true }
    });
    for (let i = 0;i < keys.length; ++i) {
      const key = keys[i];
      if (!(key in BaseEvent.prototype)) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        const isFunc = typeof descriptor.value === "function";
        Object.defineProperty(CustomEvent.prototype, key, isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key));
      }
    }
    return CustomEvent;
  };
  var getWrapper = function(proto) {
    if (proto == null || proto === Object.prototype) {
      return Event;
    }
    let wrapper = wrappers.get(proto);
    if (wrapper == null) {
      wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
      wrappers.set(proto, wrapper);
    }
    return wrapper;
  };
  var wrapEvent = function(eventTarget, event) {
    const Wrapper = getWrapper(Object.getPrototypeOf(event));
    return new Wrapper(eventTarget, event);
  };
  var isStopped = function(event) {
    return pd(event).immediateStopped;
  };
  var setEventPhase = function(event, eventPhase) {
    pd(event).eventPhase = eventPhase;
  };
  var setCurrentTarget = function(event, currentTarget) {
    pd(event).currentTarget = currentTarget;
  };
  var setPassiveListener = function(event, passiveListener) {
    pd(event).passiveListener = passiveListener;
  };
  var isObject = function(x) {
    return x !== null && typeof x === "object";
  };
  var getListeners = function(eventTarget) {
    const listeners = listenersMap.get(eventTarget);
    if (listeners == null) {
      throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    }
    return listeners;
  };
  var defineEventAttributeDescriptor = function(eventName) {
    return {
      get() {
        const listeners = getListeners(this);
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listenerType === ATTRIBUTE) {
            return node.listener;
          }
          node = node.next;
        }
        return null;
      },
      set(listener) {
        if (typeof listener !== "function" && !isObject(listener)) {
          listener = null;
        }
        const listeners = getListeners(this);
        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listenerType === ATTRIBUTE) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
          } else {
            prev = node;
          }
          node = node.next;
        }
        if (listener !== null) {
          const newNode = {
            listener,
            listenerType: ATTRIBUTE,
            passive: false,
            once: false,
            next: null
          };
          if (prev === null) {
            listeners.set(eventName, newNode);
          } else {
            prev.next = newNode;
          }
        }
      },
      configurable: true,
      enumerable: true
    };
  };
  var defineEventAttribute = function(eventTargetPrototype, eventName) {
    Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
  };
  var defineCustomEventTarget = function(eventNames) {
    function CustomEventTarget() {
      EventTarget.call(this);
    }
    CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
      constructor: {
        value: CustomEventTarget,
        configurable: true,
        writable: true
      }
    });
    for (let i = 0;i < eventNames.length; ++i) {
      defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
    }
    return CustomEventTarget;
  };
  var EventTarget = function() {
    if (this instanceof EventTarget) {
      listenersMap.set(this, new Map);
      return;
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      return defineCustomEventTarget(arguments[0]);
    }
    if (arguments.length > 0) {
      const types = new Array(arguments.length);
      for (let i = 0;i < arguments.length; ++i) {
        types[i] = arguments[i];
      }
      return defineCustomEventTarget(types);
    }
    throw new TypeError("Cannot call a class as a function");
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var privateData = new WeakMap;
  var wrappers = new WeakMap;
  Event.prototype = {
    get type() {
      return pd(this).event.type;
    },
    get target() {
      return pd(this).eventTarget;
    },
    get currentTarget() {
      return pd(this).currentTarget;
    },
    composedPath() {
      const currentTarget = pd(this).currentTarget;
      if (currentTarget == null) {
        return [];
      }
      return [currentTarget];
    },
    get NONE() {
      return 0;
    },
    get CAPTURING_PHASE() {
      return 1;
    },
    get AT_TARGET() {
      return 2;
    },
    get BUBBLING_PHASE() {
      return 3;
    },
    get eventPhase() {
      return pd(this).eventPhase;
    },
    stopPropagation() {
      const data = pd(this);
      data.stopped = true;
      if (typeof data.event.stopPropagation === "function") {
        data.event.stopPropagation();
      }
    },
    stopImmediatePropagation() {
      const data = pd(this);
      data.stopped = true;
      data.immediateStopped = true;
      if (typeof data.event.stopImmediatePropagation === "function") {
        data.event.stopImmediatePropagation();
      }
    },
    get bubbles() {
      return Boolean(pd(this).event.bubbles);
    },
    get cancelable() {
      return Boolean(pd(this).event.cancelable);
    },
    preventDefault() {
      setCancelFlag(pd(this));
    },
    get defaultPrevented() {
      return pd(this).canceled;
    },
    get composed() {
      return Boolean(pd(this).event.composed);
    },
    get timeStamp() {
      return pd(this).timeStamp;
    },
    get srcElement() {
      return pd(this).eventTarget;
    },
    get cancelBubble() {
      return pd(this).stopped;
    },
    set cancelBubble(value) {
      if (!value) {
        return;
      }
      const data = pd(this);
      data.stopped = true;
      if (typeof data.event.cancelBubble === "boolean") {
        data.event.cancelBubble = true;
      }
    },
    get returnValue() {
      return !pd(this).canceled;
    },
    set returnValue(value) {
      if (!value) {
        setCancelFlag(pd(this));
      }
    },
    initEvent() {
    }
  };
  Object.defineProperty(Event.prototype, "constructor", {
    value: Event,
    configurable: true,
    writable: true
  });
  if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, window.Event.prototype);
    wrappers.set(window.Event.prototype, Event);
  }
  var listenersMap = new WeakMap;
  var CAPTURE = 1;
  var BUBBLE = 2;
  var ATTRIBUTE = 3;
  EventTarget.prototype = {
    addEventListener(eventName, listener, options) {
      if (listener == null) {
        return;
      }
      if (typeof listener !== "function" && !isObject(listener)) {
        throw new TypeError("'listener' should be a function or an object.");
      }
      const listeners = getListeners(this);
      const optionsIsObj = isObject(options);
      const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
      const listenerType = capture ? CAPTURE : BUBBLE;
      const newNode = {
        listener,
        listenerType,
        passive: optionsIsObj && Boolean(options.passive),
        once: optionsIsObj && Boolean(options.once),
        next: null
      };
      let node = listeners.get(eventName);
      if (node === undefined) {
        listeners.set(eventName, newNode);
        return;
      }
      let prev = null;
      while (node != null) {
        if (node.listener === listener && node.listenerType === listenerType) {
          return;
        }
        prev = node;
        node = node.next;
      }
      prev.next = newNode;
    },
    removeEventListener(eventName, listener, options) {
      if (listener == null) {
        return;
      }
      const listeners = getListeners(this);
      const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
      const listenerType = capture ? CAPTURE : BUBBLE;
      let prev = null;
      let node = listeners.get(eventName);
      while (node != null) {
        if (node.listener === listener && node.listenerType === listenerType) {
          if (prev !== null) {
            prev.next = node.next;
          } else if (node.next !== null) {
            listeners.set(eventName, node.next);
          } else {
            listeners.delete(eventName);
          }
          return;
        }
        prev = node;
        node = node.next;
      }
    },
    dispatchEvent(event) {
      if (event == null || typeof event.type !== "string") {
        throw new TypeError('"event.type" should be a string.');
      }
      const listeners = getListeners(this);
      const eventName = event.type;
      let node = listeners.get(eventName);
      if (node == null) {
        return true;
      }
      const wrappedEvent = wrapEvent(this, event);
      let prev = null;
      while (node != null) {
        if (node.once) {
          if (prev !== null) {
            prev.next = node.next;
          } else if (node.next !== null) {
            listeners.set(eventName, node.next);
          } else {
            listeners.delete(eventName);
          }
        } else {
          prev = node;
        }
        setPassiveListener(wrappedEvent, node.passive ? node.listener : null);
        if (typeof node.listener === "function") {
          try {
            node.listener.call(this, wrappedEvent);
          } catch (err) {
            if (typeof console !== "undefined" && typeof console.error === "function") {
              console.error(err);
            }
          }
        } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
          node.listener.handleEvent(wrappedEvent);
        }
        if (isStopped(wrappedEvent)) {
          break;
        }
        node = node.next;
      }
      setPassiveListener(wrappedEvent, null);
      setEventPhase(wrappedEvent, 0);
      setCurrentTarget(wrappedEvent, null);
      return !wrappedEvent.defaultPrevented;
    }
  };
  Object.defineProperty(EventTarget.prototype, "constructor", {
    value: EventTarget,
    configurable: true,
    writable: true
  });
  if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
  }
  exports.defineEventAttribute = defineEventAttribute;
  exports.EventTarget = EventTarget;
  exports.default = EventTarget;
  module.exports = EventTarget;
  module.exports.EventTarget = module.exports["default"] = EventTarget;
  module.exports.defineEventAttribute = defineEventAttribute;
});

// node_modules/abort-controller/dist/abort-controller.js
var require_abort_controller = __commonJS((exports, module) => {
  var createAbortSignal = function() {
    const signal = Object.create(AbortSignal.prototype);
    eventTargetShim.EventTarget.call(signal);
    abortedFlags.set(signal, false);
    return signal;
  };
  var abortSignal = function(signal) {
    if (abortedFlags.get(signal) !== false) {
      return;
    }
    abortedFlags.set(signal, true);
    signal.dispatchEvent({ type: "abort" });
  };
  var getSignal = function(controller) {
    const signal = signals.get(controller);
    if (signal == null) {
      throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
    }
    return signal;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var eventTargetShim = require_event_target_shim();

  class AbortSignal extends eventTargetShim.EventTarget {
    constructor() {
      super();
      throw new TypeError("AbortSignal cannot be constructed directly");
    }
    get aborted() {
      const aborted = abortedFlags.get(this);
      if (typeof aborted !== "boolean") {
        throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
      }
      return aborted;
    }
  }
  eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
  var abortedFlags = new WeakMap;
  Object.defineProperties(AbortSignal.prototype, {
    aborted: { enumerable: true }
  });
  if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
      configurable: true,
      value: "AbortSignal"
    });
  }

  class AbortController2 {
    constructor() {
      signals.set(this, createAbortSignal());
    }
    get signal() {
      return getSignal(this);
    }
    abort() {
      abortSignal(getSignal(this));
    }
  }
  var signals = new WeakMap;
  Object.defineProperties(AbortController2.prototype, {
    signal: { enumerable: true },
    abort: { enumerable: true }
  });
  if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortController2.prototype, Symbol.toStringTag, {
      configurable: true,
      value: "AbortController"
    });
  }
  exports.AbortController = AbortController2;
  exports.AbortSignal = AbortSignal;
  exports.default = AbortController2;
  module.exports = AbortController2;
  module.exports.AbortController = module.exports["default"] = AbortController2;
  module.exports.AbortSignal = AbortSignal;
});

// node_modules/web-streams-polyfill/dist/ponyfill.es2018.js
var require_ponyfill_es2018 = __commonJS((exports, module) => {
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.WebStreamsPolyfill = {}));
  })(exports, function(exports2) {
    const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
    function noop() {
      return;
    }
    function typeIsObject(x) {
      return typeof x === "object" && x !== null || typeof x === "function";
    }
    const rethrowAssertionErrorRejection = noop;
    function setFunctionName(fn, name) {
      try {
        Object.defineProperty(fn, "name", {
          value: name,
          configurable: true
        });
      } catch (_a) {
      }
    }
    const originalPromise = Promise;
    const originalPromiseThen = Promise.prototype.then;
    const originalPromiseReject = Promise.reject.bind(originalPromise);
    function newPromise(executor) {
      return new originalPromise(executor);
    }
    function promiseResolvedWith(value) {
      return newPromise((resolve) => resolve(value));
    }
    function promiseRejectedWith(reason) {
      return originalPromiseReject(reason);
    }
    function PerformPromiseThen(promise, onFulfilled, onRejected) {
      return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }
    function uponPromise(promise, onFulfilled, onRejected) {
      PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
    }
    function uponFulfillment(promise, onFulfilled) {
      uponPromise(promise, onFulfilled);
    }
    function uponRejection(promise, onRejected) {
      uponPromise(promise, undefined, onRejected);
    }
    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
      return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
    }
    function setPromiseIsHandledToTrue(promise) {
      PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
    }
    let _queueMicrotask = (callback) => {
      if (typeof queueMicrotask === "function") {
        _queueMicrotask = queueMicrotask;
      } else {
        const resolvedPromise = promiseResolvedWith(undefined);
        _queueMicrotask = (cb) => PerformPromiseThen(resolvedPromise, cb);
      }
      return _queueMicrotask(callback);
    };
    function reflectCall(F, V, args) {
      if (typeof F !== "function") {
        throw new TypeError("Argument is not a function");
      }
      return Function.prototype.apply.call(F, V, args);
    }
    function promiseCall(F, V, args) {
      try {
        return promiseResolvedWith(reflectCall(F, V, args));
      } catch (value) {
        return promiseRejectedWith(value);
      }
    }
    const QUEUE_MAX_ARRAY_SIZE = 16384;

    class SimpleQueue {
      constructor() {
        this._cursor = 0;
        this._size = 0;
        this._front = {
          _elements: [],
          _next: undefined
        };
        this._back = this._front;
        this._cursor = 0;
        this._size = 0;
      }
      get length() {
        return this._size;
      }
      push(element) {
        const oldBack = this._back;
        let newBack = oldBack;
        if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
          newBack = {
            _elements: [],
            _next: undefined
          };
        }
        oldBack._elements.push(element);
        if (newBack !== oldBack) {
          this._back = newBack;
          oldBack._next = newBack;
        }
        ++this._size;
      }
      shift() {
        const oldFront = this._front;
        let newFront = oldFront;
        const oldCursor = this._cursor;
        let newCursor = oldCursor + 1;
        const elements = oldFront._elements;
        const element = elements[oldCursor];
        if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
          newFront = oldFront._next;
          newCursor = 0;
        }
        --this._size;
        this._cursor = newCursor;
        if (oldFront !== newFront) {
          this._front = newFront;
        }
        elements[oldCursor] = undefined;
        return element;
      }
      forEach(callback) {
        let i = this._cursor;
        let node = this._front;
        let elements = node._elements;
        while (i !== elements.length || node._next !== undefined) {
          if (i === elements.length) {
            node = node._next;
            elements = node._elements;
            i = 0;
            if (elements.length === 0) {
              break;
            }
          }
          callback(elements[i]);
          ++i;
        }
      }
      peek() {
        const front = this._front;
        const cursor = this._cursor;
        return front._elements[cursor];
      }
    }
    const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
    const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
    const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
    const PullSteps = SymbolPolyfill("[[PullSteps]]");
    const ReleaseSteps = SymbolPolyfill("[[ReleaseSteps]]");
    function ReadableStreamReaderGenericInitialize(reader, stream) {
      reader._ownerReadableStream = stream;
      stream._reader = reader;
      if (stream._state === "readable") {
        defaultReaderClosedPromiseInitialize(reader);
      } else if (stream._state === "closed") {
        defaultReaderClosedPromiseInitializeAsResolved(reader);
      } else {
        defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
      }
    }
    function ReadableStreamReaderGenericCancel(reader, reason) {
      const stream = reader._ownerReadableStream;
      return ReadableStreamCancel(stream, reason);
    }
    function ReadableStreamReaderGenericRelease(reader) {
      const stream = reader._ownerReadableStream;
      if (stream._state === "readable") {
        defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
      } else {
        defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
      }
      stream._readableStreamController[ReleaseSteps]();
      stream._reader = undefined;
      reader._ownerReadableStream = undefined;
    }
    function readerLockException(name) {
      return new TypeError("Cannot " + name + " a stream using a released reader");
    }
    function defaultReaderClosedPromiseInitialize(reader) {
      reader._closedPromise = newPromise((resolve, reject) => {
        reader._closedPromise_resolve = resolve;
        reader._closedPromise_reject = reject;
      });
    }
    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
      defaultReaderClosedPromiseInitialize(reader);
      defaultReaderClosedPromiseReject(reader, reason);
    }
    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
      defaultReaderClosedPromiseInitialize(reader);
      defaultReaderClosedPromiseResolve(reader);
    }
    function defaultReaderClosedPromiseReject(reader, reason) {
      if (reader._closedPromise_reject === undefined) {
        return;
      }
      setPromiseIsHandledToTrue(reader._closedPromise);
      reader._closedPromise_reject(reason);
      reader._closedPromise_resolve = undefined;
      reader._closedPromise_reject = undefined;
    }
    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
      defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
    }
    function defaultReaderClosedPromiseResolve(reader) {
      if (reader._closedPromise_resolve === undefined) {
        return;
      }
      reader._closedPromise_resolve(undefined);
      reader._closedPromise_resolve = undefined;
      reader._closedPromise_reject = undefined;
    }
    const NumberIsFinite = Number.isFinite || function(x) {
      return typeof x === "number" && isFinite(x);
    };
    const MathTrunc = Math.trunc || function(v) {
      return v < 0 ? Math.ceil(v) : Math.floor(v);
    };
    function isDictionary(x) {
      return typeof x === "object" || typeof x === "function";
    }
    function assertDictionary(obj, context) {
      if (obj !== undefined && !isDictionary(obj)) {
        throw new TypeError(`${context} is not an object.`);
      }
    }
    function assertFunction(x, context) {
      if (typeof x !== "function") {
        throw new TypeError(`${context} is not a function.`);
      }
    }
    function isObject(x) {
      return typeof x === "object" && x !== null || typeof x === "function";
    }
    function assertObject(x, context) {
      if (!isObject(x)) {
        throw new TypeError(`${context} is not an object.`);
      }
    }
    function assertRequiredArgument(x, position, context) {
      if (x === undefined) {
        throw new TypeError(`Parameter ${position} is required in '${context}'.`);
      }
    }
    function assertRequiredField(x, field, context) {
      if (x === undefined) {
        throw new TypeError(`${field} is required in '${context}'.`);
      }
    }
    function convertUnrestrictedDouble(value) {
      return Number(value);
    }
    function censorNegativeZero(x) {
      return x === 0 ? 0 : x;
    }
    function integerPart(x) {
      return censorNegativeZero(MathTrunc(x));
    }
    function convertUnsignedLongLongWithEnforceRange(value, context) {
      const lowerBound = 0;
      const upperBound = Number.MAX_SAFE_INTEGER;
      let x = Number(value);
      x = censorNegativeZero(x);
      if (!NumberIsFinite(x)) {
        throw new TypeError(`${context} is not a finite number`);
      }
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
      }
      if (!NumberIsFinite(x) || x === 0) {
        return 0;
      }
      return x;
    }
    function assertReadableStream(x, context) {
      if (!IsReadableStream(x)) {
        throw new TypeError(`${context} is not a ReadableStream.`);
      }
    }
    function AcquireReadableStreamDefaultReader(stream) {
      return new ReadableStreamDefaultReader(stream);
    }
    function ReadableStreamAddReadRequest(stream, readRequest) {
      stream._reader._readRequests.push(readRequest);
    }
    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
      const reader = stream._reader;
      const readRequest = reader._readRequests.shift();
      if (done) {
        readRequest._closeSteps();
      } else {
        readRequest._chunkSteps(chunk);
      }
    }
    function ReadableStreamGetNumReadRequests(stream) {
      return stream._reader._readRequests.length;
    }
    function ReadableStreamHasDefaultReader(stream) {
      const reader = stream._reader;
      if (reader === undefined) {
        return false;
      }
      if (!IsReadableStreamDefaultReader(reader)) {
        return false;
      }
      return true;
    }

    class ReadableStreamDefaultReader {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
        assertReadableStream(stream, "First parameter");
        if (IsReadableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive reading by another reader");
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readRequests = new SimpleQueue;
      }
      get closed() {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      cancel(reason = undefined) {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
        }
        if (this._ownerReadableStream === undefined) {
          return promiseRejectedWith(readerLockException("cancel"));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
      }
      read() {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("read"));
        }
        if (this._ownerReadableStream === undefined) {
          return promiseRejectedWith(readerLockException("read from"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve, reject) => {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        const readRequest = {
          _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
          _closeSteps: () => resolvePromise({ value: undefined, done: true }),
          _errorSteps: (e) => rejectPromise(e)
        };
        ReadableStreamDefaultReaderRead(this, readRequest);
        return promise;
      }
      releaseLock() {
        if (!IsReadableStreamDefaultReader(this)) {
          throw defaultReaderBrandCheckException("releaseLock");
        }
        if (this._ownerReadableStream === undefined) {
          return;
        }
        ReadableStreamDefaultReaderRelease(this);
      }
    }
    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
      cancel: { enumerable: true },
      read: { enumerable: true },
      releaseLock: { enumerable: true },
      closed: { enumerable: true }
    });
    setFunctionName(ReadableStreamDefaultReader.prototype.cancel, "cancel");
    setFunctionName(ReadableStreamDefaultReader.prototype.read, "read");
    setFunctionName(ReadableStreamDefaultReader.prototype.releaseLock, "releaseLock");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultReader",
        configurable: true
      });
    }
    function IsReadableStreamDefaultReader(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
        return false;
      }
      return x instanceof ReadableStreamDefaultReader;
    }
    function ReadableStreamDefaultReaderRead(reader, readRequest) {
      const stream = reader._ownerReadableStream;
      stream._disturbed = true;
      if (stream._state === "closed") {
        readRequest._closeSteps();
      } else if (stream._state === "errored") {
        readRequest._errorSteps(stream._storedError);
      } else {
        stream._readableStreamController[PullSteps](readRequest);
      }
    }
    function ReadableStreamDefaultReaderRelease(reader) {
      ReadableStreamReaderGenericRelease(reader);
      const e = new TypeError("Reader was released");
      ReadableStreamDefaultReaderErrorReadRequests(reader, e);
    }
    function ReadableStreamDefaultReaderErrorReadRequests(reader, e) {
      const readRequests = reader._readRequests;
      reader._readRequests = new SimpleQueue;
      readRequests.forEach((readRequest) => {
        readRequest._errorSteps(e);
      });
    }
    function defaultReaderBrandCheckException(name) {
      return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
    }
    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
    }).prototype);

    class ReadableStreamAsyncIteratorImpl {
      constructor(reader, preventCancel) {
        this._ongoingPromise = undefined;
        this._isFinished = false;
        this._reader = reader;
        this._preventCancel = preventCancel;
      }
      next() {
        const nextSteps = () => this._nextSteps();
        this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
        return this._ongoingPromise;
      }
      return(value) {
        const returnSteps = () => this._returnSteps(value);
        return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
      }
      _nextSteps() {
        if (this._isFinished) {
          return Promise.resolve({ value: undefined, done: true });
        }
        const reader = this._reader;
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve, reject) => {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        const readRequest = {
          _chunkSteps: (chunk) => {
            this._ongoingPromise = undefined;
            _queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
          },
          _closeSteps: () => {
            this._ongoingPromise = undefined;
            this._isFinished = true;
            ReadableStreamReaderGenericRelease(reader);
            resolvePromise({ value: undefined, done: true });
          },
          _errorSteps: (reason) => {
            this._ongoingPromise = undefined;
            this._isFinished = true;
            ReadableStreamReaderGenericRelease(reader);
            rejectPromise(reason);
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
        return promise;
      }
      _returnSteps(value) {
        if (this._isFinished) {
          return Promise.resolve({ value, done: true });
        }
        this._isFinished = true;
        const reader = this._reader;
        if (!this._preventCancel) {
          const result = ReadableStreamReaderGenericCancel(reader, value);
          ReadableStreamReaderGenericRelease(reader);
          return transformPromiseWith(result, () => ({ value, done: true }));
        }
        ReadableStreamReaderGenericRelease(reader);
        return promiseResolvedWith({ value, done: true });
      }
    }
    const ReadableStreamAsyncIteratorPrototype = {
      next() {
        if (!IsReadableStreamAsyncIterator(this)) {
          return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
        }
        return this._asyncIteratorImpl.next();
      },
      return(value) {
        if (!IsReadableStreamAsyncIterator(this)) {
          return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
        }
        return this._asyncIteratorImpl.return(value);
      }
    };
    if (AsyncIteratorPrototype !== undefined) {
      Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
    }
    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
      const reader = AcquireReadableStreamDefaultReader(stream);
      const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
      const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
      iterator._asyncIteratorImpl = impl;
      return iterator;
    }
    function IsReadableStreamAsyncIterator(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
        return false;
      }
      try {
        return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
      } catch (_a) {
        return false;
      }
    }
    function streamAsyncIteratorBrandCheckException(name) {
      return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
    }
    const NumberIsNaN = Number.isNaN || function(x) {
      return x !== x;
    };
    function CreateArrayFromList(elements) {
      return elements.slice();
    }
    function CopyDataBlockBytes(dest, destOffset, src, srcOffset, n) {
      new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
    }
    let TransferArrayBuffer = (O) => {
      if (typeof O.transfer === "function") {
        TransferArrayBuffer = (buffer) => buffer.transfer();
      } else if (typeof structuredClone === "function") {
        TransferArrayBuffer = (buffer) => structuredClone(buffer, { transfer: [buffer] });
      } else {
        TransferArrayBuffer = (buffer) => buffer;
      }
      return TransferArrayBuffer(O);
    };
    let IsDetachedBuffer = (O) => {
      if (typeof O.detached === "boolean") {
        IsDetachedBuffer = (buffer) => buffer.detached;
      } else {
        IsDetachedBuffer = (buffer) => buffer.byteLength === 0;
      }
      return IsDetachedBuffer(O);
    };
    function ArrayBufferSlice(buffer, begin, end) {
      if (buffer.slice) {
        return buffer.slice(begin, end);
      }
      const length = end - begin;
      const slice = new ArrayBuffer(length);
      CopyDataBlockBytes(slice, 0, buffer, begin, length);
      return slice;
    }
    function GetMethod(receiver, prop) {
      const func = receiver[prop];
      if (func === undefined || func === null) {
        return;
      }
      if (typeof func !== "function") {
        throw new TypeError(`${String(prop)} is not a function`);
      }
      return func;
    }
    function CreateAsyncFromSyncIterator(syncIteratorRecord) {
      const syncIterable = {
        [SymbolPolyfill.iterator]: () => syncIteratorRecord.iterator
      };
      const asyncIterator = async function* () {
        return yield* syncIterable;
      }();
      const nextMethod = asyncIterator.next;
      return { iterator: asyncIterator, nextMethod, done: false };
    }
    function GetIterator(obj, hint = "sync", method) {
      if (method === undefined) {
        if (hint === "async") {
          method = GetMethod(obj, SymbolPolyfill.asyncIterator);
          if (method === undefined) {
            const syncMethod = GetMethod(obj, SymbolPolyfill.iterator);
            const syncIteratorRecord = GetIterator(obj, "sync", syncMethod);
            return CreateAsyncFromSyncIterator(syncIteratorRecord);
          }
        } else {
          method = GetMethod(obj, SymbolPolyfill.iterator);
        }
      }
      if (method === undefined) {
        throw new TypeError("The object is not iterable");
      }
      const iterator = reflectCall(method, obj, []);
      if (!typeIsObject(iterator)) {
        throw new TypeError("The iterator method must return an object");
      }
      const nextMethod = iterator.next;
      return { iterator, nextMethod, done: false };
    }
    function IteratorNext(iteratorRecord) {
      const result = reflectCall(iteratorRecord.nextMethod, iteratorRecord.iterator, []);
      if (!typeIsObject(result)) {
        throw new TypeError("The iterator.next() method must return an object");
      }
      return result;
    }
    function IteratorComplete(iterResult) {
      return Boolean(iterResult.done);
    }
    function IteratorValue(iterResult) {
      return iterResult.value;
    }
    function IsNonNegativeNumber(v) {
      if (typeof v !== "number") {
        return false;
      }
      if (NumberIsNaN(v)) {
        return false;
      }
      if (v < 0) {
        return false;
      }
      return true;
    }
    function CloneAsUint8Array(O) {
      const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
      return new Uint8Array(buffer);
    }
    function DequeueValue(container) {
      const pair = container._queue.shift();
      container._queueTotalSize -= pair.size;
      if (container._queueTotalSize < 0) {
        container._queueTotalSize = 0;
      }
      return pair.value;
    }
    function EnqueueValueWithSize(container, value, size) {
      if (!IsNonNegativeNumber(size) || size === Infinity) {
        throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
      }
      container._queue.push({ value, size });
      container._queueTotalSize += size;
    }
    function PeekQueueValue(container) {
      const pair = container._queue.peek();
      return pair.value;
    }
    function ResetQueue(container) {
      container._queue = new SimpleQueue;
      container._queueTotalSize = 0;
    }
    function isDataViewConstructor(ctor) {
      return ctor === DataView;
    }
    function isDataView(view) {
      return isDataViewConstructor(view.constructor);
    }
    function arrayBufferViewElementSize(ctor) {
      if (isDataViewConstructor(ctor)) {
        return 1;
      }
      return ctor.BYTES_PER_ELEMENT;
    }

    class ReadableStreamBYOBRequest {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get view() {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("view");
        }
        return this._view;
      }
      respond(bytesWritten) {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("respond");
        }
        assertRequiredArgument(bytesWritten, 1, "respond");
        bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
        if (this._associatedReadableByteStreamController === undefined) {
          throw new TypeError("This BYOB request has been invalidated");
        }
        if (IsDetachedBuffer(this._view.buffer)) {
          throw new TypeError(`The BYOB request's buffer has been detached and so cannot be used as a response`);
        }
        ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
      }
      respondWithNewView(view) {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("respondWithNewView");
        }
        assertRequiredArgument(view, 1, "respondWithNewView");
        if (!ArrayBuffer.isView(view)) {
          throw new TypeError("You can only respond with array buffer views");
        }
        if (this._associatedReadableByteStreamController === undefined) {
          throw new TypeError("This BYOB request has been invalidated");
        }
        if (IsDetachedBuffer(view.buffer)) {
          throw new TypeError("The given view\'s buffer has been detached and so cannot be used as a response");
        }
        ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
      }
    }
    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
      respond: { enumerable: true },
      respondWithNewView: { enumerable: true },
      view: { enumerable: true }
    });
    setFunctionName(ReadableStreamBYOBRequest.prototype.respond, "respond");
    setFunctionName(ReadableStreamBYOBRequest.prototype.respondWithNewView, "respondWithNewView");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBRequest",
        configurable: true
      });
    }

    class ReadableByteStreamController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get byobRequest() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("byobRequest");
        }
        return ReadableByteStreamControllerGetBYOBRequest(this);
      }
      get desiredSize() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("desiredSize");
        }
        return ReadableByteStreamControllerGetDesiredSize(this);
      }
      close() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("close");
        }
        if (this._closeRequested) {
          throw new TypeError("The stream has already been closed; do not close it again!");
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== "readable") {
          throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
        }
        ReadableByteStreamControllerClose(this);
      }
      enqueue(chunk) {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("enqueue");
        }
        assertRequiredArgument(chunk, 1, "enqueue");
        if (!ArrayBuffer.isView(chunk)) {
          throw new TypeError("chunk must be an array buffer view");
        }
        if (chunk.byteLength === 0) {
          throw new TypeError("chunk must have non-zero byteLength");
        }
        if (chunk.buffer.byteLength === 0) {
          throw new TypeError(`chunk's buffer must have non-zero byteLength`);
        }
        if (this._closeRequested) {
          throw new TypeError("stream is closed or draining");
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== "readable") {
          throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
        }
        ReadableByteStreamControllerEnqueue(this, chunk);
      }
      error(e = undefined) {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("error");
        }
        ReadableByteStreamControllerError(this, e);
      }
      [CancelSteps](reason) {
        ReadableByteStreamControllerClearPendingPullIntos(this);
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableByteStreamControllerClearAlgorithms(this);
        return result;
      }
      [PullSteps](readRequest) {
        const stream = this._controlledReadableByteStream;
        if (this._queueTotalSize > 0) {
          ReadableByteStreamControllerFillReadRequestFromQueue(this, readRequest);
          return;
        }
        const autoAllocateChunkSize = this._autoAllocateChunkSize;
        if (autoAllocateChunkSize !== undefined) {
          let buffer;
          try {
            buffer = new ArrayBuffer(autoAllocateChunkSize);
          } catch (bufferE) {
            readRequest._errorSteps(bufferE);
            return;
          }
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: autoAllocateChunkSize,
            byteOffset: 0,
            byteLength: autoAllocateChunkSize,
            bytesFilled: 0,
            minimumFill: 1,
            elementSize: 1,
            viewConstructor: Uint8Array,
            readerType: "default"
          };
          this._pendingPullIntos.push(pullIntoDescriptor);
        }
        ReadableStreamAddReadRequest(stream, readRequest);
        ReadableByteStreamControllerCallPullIfNeeded(this);
      }
      [ReleaseSteps]() {
        if (this._pendingPullIntos.length > 0) {
          const firstPullInto = this._pendingPullIntos.peek();
          firstPullInto.readerType = "none";
          this._pendingPullIntos = new SimpleQueue;
          this._pendingPullIntos.push(firstPullInto);
        }
      }
    }
    Object.defineProperties(ReadableByteStreamController.prototype, {
      close: { enumerable: true },
      enqueue: { enumerable: true },
      error: { enumerable: true },
      byobRequest: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    setFunctionName(ReadableByteStreamController.prototype.close, "close");
    setFunctionName(ReadableByteStreamController.prototype.enqueue, "enqueue");
    setFunctionName(ReadableByteStreamController.prototype.error, "error");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableByteStreamController",
        configurable: true
      });
    }
    function IsReadableByteStreamController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
        return false;
      }
      return x instanceof ReadableByteStreamController;
    }
    function IsReadableStreamBYOBRequest(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
        return false;
      }
      return x instanceof ReadableStreamBYOBRequest;
    }
    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
      const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
      if (!shouldPull) {
        return;
      }
      if (controller._pulling) {
        controller._pullAgain = true;
        return;
      }
      controller._pulling = true;
      const pullPromise = controller._pullAlgorithm();
      uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain) {
          controller._pullAgain = false;
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        return null;
      }, (e) => {
        ReadableByteStreamControllerError(controller, e);
        return null;
      });
    }
    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      controller._pendingPullIntos = new SimpleQueue;
    }
    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
      let done = false;
      if (stream._state === "closed") {
        done = true;
      }
      const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
      if (pullIntoDescriptor.readerType === "default") {
        ReadableStreamFulfillReadRequest(stream, filledView, done);
      } else {
        ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
      }
    }
    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
      const bytesFilled = pullIntoDescriptor.bytesFilled;
      const elementSize = pullIntoDescriptor.elementSize;
      return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
    }
    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
      controller._queue.push({ buffer, byteOffset, byteLength });
      controller._queueTotalSize += byteLength;
    }
    function ReadableByteStreamControllerEnqueueClonedChunkToQueue(controller, buffer, byteOffset, byteLength) {
      let clonedChunk;
      try {
        clonedChunk = ArrayBufferSlice(buffer, byteOffset, byteOffset + byteLength);
      } catch (cloneE) {
        ReadableByteStreamControllerError(controller, cloneE);
        throw cloneE;
      }
      ReadableByteStreamControllerEnqueueChunkToQueue(controller, clonedChunk, 0, byteLength);
    }
    function ReadableByteStreamControllerEnqueueDetachedPullIntoToQueue(controller, firstDescriptor) {
      if (firstDescriptor.bytesFilled > 0) {
        ReadableByteStreamControllerEnqueueClonedChunkToQueue(controller, firstDescriptor.buffer, firstDescriptor.byteOffset, firstDescriptor.bytesFilled);
      }
      ReadableByteStreamControllerShiftPendingPullInto(controller);
    }
    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
      const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
      const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
      let totalBytesToCopyRemaining = maxBytesToCopy;
      let ready = false;
      const remainderBytes = maxBytesFilled % pullIntoDescriptor.elementSize;
      const maxAlignedBytes = maxBytesFilled - remainderBytes;
      if (maxAlignedBytes >= pullIntoDescriptor.minimumFill) {
        totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
        ready = true;
      }
      const queue = controller._queue;
      while (totalBytesToCopyRemaining > 0) {
        const headOfQueue = queue.peek();
        const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
        const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
        if (headOfQueue.byteLength === bytesToCopy) {
          queue.shift();
        } else {
          headOfQueue.byteOffset += bytesToCopy;
          headOfQueue.byteLength -= bytesToCopy;
        }
        controller._queueTotalSize -= bytesToCopy;
        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
        totalBytesToCopyRemaining -= bytesToCopy;
      }
      return ready;
    }
    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
      pullIntoDescriptor.bytesFilled += size;
    }
    function ReadableByteStreamControllerHandleQueueDrain(controller) {
      if (controller._queueTotalSize === 0 && controller._closeRequested) {
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamClose(controller._controlledReadableByteStream);
      } else {
        ReadableByteStreamControllerCallPullIfNeeded(controller);
      }
    }
    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
      if (controller._byobRequest === null) {
        return;
      }
      controller._byobRequest._associatedReadableByteStreamController = undefined;
      controller._byobRequest._view = null;
      controller._byobRequest = null;
    }
    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
      while (controller._pendingPullIntos.length > 0) {
        if (controller._queueTotalSize === 0) {
          return;
        }
        const pullIntoDescriptor = controller._pendingPullIntos.peek();
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
        }
      }
    }
    function ReadableByteStreamControllerProcessReadRequestsUsingQueue(controller) {
      const reader = controller._controlledReadableByteStream._reader;
      while (reader._readRequests.length > 0) {
        if (controller._queueTotalSize === 0) {
          return;
        }
        const readRequest = reader._readRequests.shift();
        ReadableByteStreamControllerFillReadRequestFromQueue(controller, readRequest);
      }
    }
    function ReadableByteStreamControllerPullInto(controller, view, min, readIntoRequest) {
      const stream = controller._controlledReadableByteStream;
      const ctor = view.constructor;
      const elementSize = arrayBufferViewElementSize(ctor);
      const { byteOffset, byteLength } = view;
      const minimumFill = min * elementSize;
      let buffer;
      try {
        buffer = TransferArrayBuffer(view.buffer);
      } catch (e) {
        readIntoRequest._errorSteps(e);
        return;
      }
      const pullIntoDescriptor = {
        buffer,
        bufferByteLength: buffer.byteLength,
        byteOffset,
        byteLength,
        bytesFilled: 0,
        minimumFill,
        elementSize,
        viewConstructor: ctor,
        readerType: "byob"
      };
      if (controller._pendingPullIntos.length > 0) {
        controller._pendingPullIntos.push(pullIntoDescriptor);
        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
        return;
      }
      if (stream._state === "closed") {
        const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
        readIntoRequest._closeSteps(emptyView);
        return;
      }
      if (controller._queueTotalSize > 0) {
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          ReadableByteStreamControllerHandleQueueDrain(controller);
          readIntoRequest._chunkSteps(filledView);
          return;
        }
        if (controller._closeRequested) {
          const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
          ReadableByteStreamControllerError(controller, e);
          readIntoRequest._errorSteps(e);
          return;
        }
      }
      controller._pendingPullIntos.push(pullIntoDescriptor);
      ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
      if (firstDescriptor.readerType === "none") {
        ReadableByteStreamControllerShiftPendingPullInto(controller);
      }
      const stream = controller._controlledReadableByteStream;
      if (ReadableStreamHasBYOBReader(stream)) {
        while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
          const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
          ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
        }
      }
    }
    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
      ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
      if (pullIntoDescriptor.readerType === "none") {
        ReadableByteStreamControllerEnqueueDetachedPullIntoToQueue(controller, pullIntoDescriptor);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        return;
      }
      if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.minimumFill) {
        return;
      }
      ReadableByteStreamControllerShiftPendingPullInto(controller);
      const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
      if (remainderSize > 0) {
        const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        ReadableByteStreamControllerEnqueueClonedChunkToQueue(controller, pullIntoDescriptor.buffer, end - remainderSize, remainderSize);
      }
      pullIntoDescriptor.bytesFilled -= remainderSize;
      ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
      ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    }
    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor);
      } else {
        ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
      }
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
      const descriptor = controller._pendingPullIntos.shift();
      return descriptor;
    }
    function ReadableByteStreamControllerShouldCallPull(controller) {
      const stream = controller._controlledReadableByteStream;
      if (stream._state !== "readable") {
        return false;
      }
      if (controller._closeRequested) {
        return false;
      }
      if (!controller._started) {
        return false;
      }
      if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
      }
      if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
        return true;
      }
      const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
      if (desiredSize > 0) {
        return true;
      }
      return false;
    }
    function ReadableByteStreamControllerClearAlgorithms(controller) {
      controller._pullAlgorithm = undefined;
      controller._cancelAlgorithm = undefined;
    }
    function ReadableByteStreamControllerClose(controller) {
      const stream = controller._controlledReadableByteStream;
      if (controller._closeRequested || stream._state !== "readable") {
        return;
      }
      if (controller._queueTotalSize > 0) {
        controller._closeRequested = true;
        return;
      }
      if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (firstPendingPullInto.bytesFilled % firstPendingPullInto.elementSize !== 0) {
          const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
          ReadableByteStreamControllerError(controller, e);
          throw e;
        }
      }
      ReadableByteStreamControllerClearAlgorithms(controller);
      ReadableStreamClose(stream);
    }
    function ReadableByteStreamControllerEnqueue(controller, chunk) {
      const stream = controller._controlledReadableByteStream;
      if (controller._closeRequested || stream._state !== "readable") {
        return;
      }
      const { buffer, byteOffset, byteLength } = chunk;
      if (IsDetachedBuffer(buffer)) {
        throw new TypeError("chunk\'s buffer is detached and so cannot be enqueued");
      }
      const transferredBuffer = TransferArrayBuffer(buffer);
      if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (IsDetachedBuffer(firstPendingPullInto.buffer)) {
          throw new TypeError("The BYOB request\'s buffer has been detached and so cannot be filled with an enqueued chunk");
        }
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
        if (firstPendingPullInto.readerType === "none") {
          ReadableByteStreamControllerEnqueueDetachedPullIntoToQueue(controller, firstPendingPullInto);
        }
      }
      if (ReadableStreamHasDefaultReader(stream)) {
        ReadableByteStreamControllerProcessReadRequestsUsingQueue(controller);
        if (ReadableStreamGetNumReadRequests(stream) === 0) {
          ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        } else {
          if (controller._pendingPullIntos.length > 0) {
            ReadableByteStreamControllerShiftPendingPullInto(controller);
          }
          const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
          ReadableStreamFulfillReadRequest(stream, transferredView, false);
        }
      } else if (ReadableStreamHasBYOBReader(stream)) {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
      } else {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
      }
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerError(controller, e) {
      const stream = controller._controlledReadableByteStream;
      if (stream._state !== "readable") {
        return;
      }
      ReadableByteStreamControllerClearPendingPullIntos(controller);
      ResetQueue(controller);
      ReadableByteStreamControllerClearAlgorithms(controller);
      ReadableStreamError(stream, e);
    }
    function ReadableByteStreamControllerFillReadRequestFromQueue(controller, readRequest) {
      const entry = controller._queue.shift();
      controller._queueTotalSize -= entry.byteLength;
      ReadableByteStreamControllerHandleQueueDrain(controller);
      const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
      readRequest._chunkSteps(view);
    }
    function ReadableByteStreamControllerGetBYOBRequest(controller) {
      if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
        const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
        SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
        controller._byobRequest = byobRequest;
      }
      return controller._byobRequest;
    }
    function ReadableByteStreamControllerGetDesiredSize(controller) {
      const state = controller._controlledReadableByteStream._state;
      if (state === "errored") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        if (bytesWritten !== 0) {
          throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
        }
      } else {
        if (bytesWritten === 0) {
          throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
        }
        if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
          throw new RangeError("bytesWritten out of range");
        }
      }
      firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
      ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
    }
    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        if (view.byteLength !== 0) {
          throw new TypeError("The view\'s length must be 0 when calling respondWithNewView() on a closed stream");
        }
      } else {
        if (view.byteLength === 0) {
          throw new TypeError("The view\'s length must be greater than 0 when calling respondWithNewView() on a readable stream");
        }
      }
      if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
        throw new RangeError("The region specified by view does not match byobRequest");
      }
      if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
        throw new RangeError("The buffer of view has different capacity than byobRequest");
      }
      if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
        throw new RangeError("The region specified by view is larger than byobRequest");
      }
      const viewByteLength = view.byteLength;
      firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
      ReadableByteStreamControllerRespondInternal(controller, viewByteLength);
    }
    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
      controller._controlledReadableByteStream = stream;
      controller._pullAgain = false;
      controller._pulling = false;
      controller._byobRequest = null;
      controller._queue = controller._queueTotalSize = undefined;
      ResetQueue(controller);
      controller._closeRequested = false;
      controller._started = false;
      controller._strategyHWM = highWaterMark;
      controller._pullAlgorithm = pullAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      controller._autoAllocateChunkSize = autoAllocateChunkSize;
      controller._pendingPullIntos = new SimpleQueue;
      stream._readableStreamController = controller;
      const startResult = startAlgorithm();
      uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableByteStreamControllerCallPullIfNeeded(controller);
        return null;
      }, (r) => {
        ReadableByteStreamControllerError(controller, r);
        return null;
      });
    }
    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
      const controller = Object.create(ReadableByteStreamController.prototype);
      let startAlgorithm;
      let pullAlgorithm;
      let cancelAlgorithm;
      if (underlyingByteSource.start !== undefined) {
        startAlgorithm = () => underlyingByteSource.start(controller);
      } else {
        startAlgorithm = () => {
          return;
        };
      }
      if (underlyingByteSource.pull !== undefined) {
        pullAlgorithm = () => underlyingByteSource.pull(controller);
      } else {
        pullAlgorithm = () => promiseResolvedWith(undefined);
      }
      if (underlyingByteSource.cancel !== undefined) {
        cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
      } else {
        cancelAlgorithm = () => promiseResolvedWith(undefined);
      }
      const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
      if (autoAllocateChunkSize === 0) {
        throw new TypeError("autoAllocateChunkSize must be greater than 0");
      }
      SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
    }
    function SetUpReadableStreamBYOBRequest(request, controller, view) {
      request._associatedReadableByteStreamController = controller;
      request._view = view;
    }
    function byobRequestBrandCheckException(name) {
      return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
    }
    function byteStreamControllerBrandCheckException(name) {
      return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
    }
    function convertReaderOptions(options, context) {
      assertDictionary(options, context);
      const mode = options === null || options === undefined ? undefined : options.mode;
      return {
        mode: mode === undefined ? undefined : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
      };
    }
    function convertReadableStreamReaderMode(mode, context) {
      mode = `${mode}`;
      if (mode !== "byob") {
        throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
      }
      return mode;
    }
    function convertByobReadOptions(options, context) {
      var _a;
      assertDictionary(options, context);
      const min = (_a = options === null || options === undefined ? undefined : options.min) !== null && _a !== undefined ? _a : 1;
      return {
        min: convertUnsignedLongLongWithEnforceRange(min, `${context} has member 'min' that`)
      };
    }
    function AcquireReadableStreamBYOBReader(stream) {
      return new ReadableStreamBYOBReader(stream);
    }
    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
      stream._reader._readIntoRequests.push(readIntoRequest);
    }
    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
      const reader = stream._reader;
      const readIntoRequest = reader._readIntoRequests.shift();
      if (done) {
        readIntoRequest._closeSteps(chunk);
      } else {
        readIntoRequest._chunkSteps(chunk);
      }
    }
    function ReadableStreamGetNumReadIntoRequests(stream) {
      return stream._reader._readIntoRequests.length;
    }
    function ReadableStreamHasBYOBReader(stream) {
      const reader = stream._reader;
      if (reader === undefined) {
        return false;
      }
      if (!IsReadableStreamBYOBReader(reader)) {
        return false;
      }
      return true;
    }

    class ReadableStreamBYOBReader {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
        assertReadableStream(stream, "First parameter");
        if (IsReadableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive reading by another reader");
        }
        if (!IsReadableByteStreamController(stream._readableStreamController)) {
          throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readIntoRequests = new SimpleQueue;
      }
      get closed() {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      cancel(reason = undefined) {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
        }
        if (this._ownerReadableStream === undefined) {
          return promiseRejectedWith(readerLockException("cancel"));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
      }
      read(view, rawOptions = {}) {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("read"));
        }
        if (!ArrayBuffer.isView(view)) {
          return promiseRejectedWith(new TypeError("view must be an array buffer view"));
        }
        if (view.byteLength === 0) {
          return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
        }
        if (view.buffer.byteLength === 0) {
          return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
        }
        if (IsDetachedBuffer(view.buffer)) {
          return promiseRejectedWith(new TypeError("view\'s buffer has been detached"));
        }
        let options;
        try {
          options = convertByobReadOptions(rawOptions, "options");
        } catch (e) {
          return promiseRejectedWith(e);
        }
        const min = options.min;
        if (min === 0) {
          return promiseRejectedWith(new TypeError("options.min must be greater than 0"));
        }
        if (!isDataView(view)) {
          if (min > view.length) {
            return promiseRejectedWith(new RangeError("options.min must be less than or equal to view\'s length"));
          }
        } else if (min > view.byteLength) {
          return promiseRejectedWith(new RangeError("options.min must be less than or equal to view\'s byteLength"));
        }
        if (this._ownerReadableStream === undefined) {
          return promiseRejectedWith(readerLockException("read from"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve, reject) => {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        const readIntoRequest = {
          _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
          _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
          _errorSteps: (e) => rejectPromise(e)
        };
        ReadableStreamBYOBReaderRead(this, view, min, readIntoRequest);
        return promise;
      }
      releaseLock() {
        if (!IsReadableStreamBYOBReader(this)) {
          throw byobReaderBrandCheckException("releaseLock");
        }
        if (this._ownerReadableStream === undefined) {
          return;
        }
        ReadableStreamBYOBReaderRelease(this);
      }
    }
    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
      cancel: { enumerable: true },
      read: { enumerable: true },
      releaseLock: { enumerable: true },
      closed: { enumerable: true }
    });
    setFunctionName(ReadableStreamBYOBReader.prototype.cancel, "cancel");
    setFunctionName(ReadableStreamBYOBReader.prototype.read, "read");
    setFunctionName(ReadableStreamBYOBReader.prototype.releaseLock, "releaseLock");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBReader",
        configurable: true
      });
    }
    function IsReadableStreamBYOBReader(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
        return false;
      }
      return x instanceof ReadableStreamBYOBReader;
    }
    function ReadableStreamBYOBReaderRead(reader, view, min, readIntoRequest) {
      const stream = reader._ownerReadableStream;
      stream._disturbed = true;
      if (stream._state === "errored") {
        readIntoRequest._errorSteps(stream._storedError);
      } else {
        ReadableByteStreamControllerPullInto(stream._readableStreamController, view, min, readIntoRequest);
      }
    }
    function ReadableStreamBYOBReaderRelease(reader) {
      ReadableStreamReaderGenericRelease(reader);
      const e = new TypeError("Reader was released");
      ReadableStreamBYOBReaderErrorReadIntoRequests(reader, e);
    }
    function ReadableStreamBYOBReaderErrorReadIntoRequests(reader, e) {
      const readIntoRequests = reader._readIntoRequests;
      reader._readIntoRequests = new SimpleQueue;
      readIntoRequests.forEach((readIntoRequest) => {
        readIntoRequest._errorSteps(e);
      });
    }
    function byobReaderBrandCheckException(name) {
      return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
    }
    function ExtractHighWaterMark(strategy, defaultHWM) {
      const { highWaterMark } = strategy;
      if (highWaterMark === undefined) {
        return defaultHWM;
      }
      if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
        throw new RangeError("Invalid highWaterMark");
      }
      return highWaterMark;
    }
    function ExtractSizeAlgorithm(strategy) {
      const { size } = strategy;
      if (!size) {
        return () => 1;
      }
      return size;
    }
    function convertQueuingStrategy(init, context) {
      assertDictionary(init, context);
      const highWaterMark = init === null || init === undefined ? undefined : init.highWaterMark;
      const size = init === null || init === undefined ? undefined : init.size;
      return {
        highWaterMark: highWaterMark === undefined ? undefined : convertUnrestrictedDouble(highWaterMark),
        size: size === undefined ? undefined : convertQueuingStrategySize(size, `${context} has member 'size' that`)
      };
    }
    function convertQueuingStrategySize(fn, context) {
      assertFunction(fn, context);
      return (chunk) => convertUnrestrictedDouble(fn(chunk));
    }
    function convertUnderlyingSink(original, context) {
      assertDictionary(original, context);
      const abort = original === null || original === undefined ? undefined : original.abort;
      const close = original === null || original === undefined ? undefined : original.close;
      const start = original === null || original === undefined ? undefined : original.start;
      const type = original === null || original === undefined ? undefined : original.type;
      const write = original === null || original === undefined ? undefined : original.write;
      return {
        abort: abort === undefined ? undefined : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
        close: close === undefined ? undefined : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
        start: start === undefined ? undefined : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
        write: write === undefined ? undefined : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
        type
      };
    }
    function convertUnderlyingSinkAbortCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSinkCloseCallback(fn, original, context) {
      assertFunction(fn, context);
      return () => promiseCall(fn, original, []);
    }
    function convertUnderlyingSinkStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertUnderlyingSinkWriteCallback(fn, original, context) {
      assertFunction(fn, context);
      return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }
    function assertWritableStream(x, context) {
      if (!IsWritableStream(x)) {
        throw new TypeError(`${context} is not a WritableStream.`);
      }
    }
    function isAbortSignal(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      try {
        return typeof value.aborted === "boolean";
      } catch (_a) {
        return false;
      }
    }
    const supportsAbortController = typeof AbortController === "function";
    function createAbortController() {
      if (supportsAbortController) {
        return new AbortController;
      }
      return;
    }

    class WritableStream {
      constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
        if (rawUnderlyingSink === undefined) {
          rawUnderlyingSink = null;
        } else {
          assertObject(rawUnderlyingSink, "First parameter");
        }
        const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
        const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
        InitializeWritableStream(this);
        const type = underlyingSink.type;
        if (type !== undefined) {
          throw new RangeError("Invalid type is specified");
        }
        const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
        const highWaterMark = ExtractHighWaterMark(strategy, 1);
        SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
      }
      get locked() {
        if (!IsWritableStream(this)) {
          throw streamBrandCheckException$2("locked");
        }
        return IsWritableStreamLocked(this);
      }
      abort(reason = undefined) {
        if (!IsWritableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$2("abort"));
        }
        if (IsWritableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
        }
        return WritableStreamAbort(this, reason);
      }
      close() {
        if (!IsWritableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$2("close"));
        }
        if (IsWritableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
        }
        if (WritableStreamCloseQueuedOrInFlight(this)) {
          return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
        }
        return WritableStreamClose(this);
      }
      getWriter() {
        if (!IsWritableStream(this)) {
          throw streamBrandCheckException$2("getWriter");
        }
        return AcquireWritableStreamDefaultWriter(this);
      }
    }
    Object.defineProperties(WritableStream.prototype, {
      abort: { enumerable: true },
      close: { enumerable: true },
      getWriter: { enumerable: true },
      locked: { enumerable: true }
    });
    setFunctionName(WritableStream.prototype.abort, "abort");
    setFunctionName(WritableStream.prototype.close, "close");
    setFunctionName(WritableStream.prototype.getWriter, "getWriter");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStream",
        configurable: true
      });
    }
    function AcquireWritableStreamDefaultWriter(stream) {
      return new WritableStreamDefaultWriter(stream);
    }
    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
      const stream = Object.create(WritableStream.prototype);
      InitializeWritableStream(stream);
      const controller = Object.create(WritableStreamDefaultController.prototype);
      SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
      return stream;
    }
    function InitializeWritableStream(stream) {
      stream._state = "writable";
      stream._storedError = undefined;
      stream._writer = undefined;
      stream._writableStreamController = undefined;
      stream._writeRequests = new SimpleQueue;
      stream._inFlightWriteRequest = undefined;
      stream._closeRequest = undefined;
      stream._inFlightCloseRequest = undefined;
      stream._pendingAbortRequest = undefined;
      stream._backpressure = false;
    }
    function IsWritableStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
        return false;
      }
      return x instanceof WritableStream;
    }
    function IsWritableStreamLocked(stream) {
      if (stream._writer === undefined) {
        return false;
      }
      return true;
    }
    function WritableStreamAbort(stream, reason) {
      var _a;
      if (stream._state === "closed" || stream._state === "errored") {
        return promiseResolvedWith(undefined);
      }
      stream._writableStreamController._abortReason = reason;
      (_a = stream._writableStreamController._abortController) === null || _a === undefined || _a.abort(reason);
      const state = stream._state;
      if (state === "closed" || state === "errored") {
        return promiseResolvedWith(undefined);
      }
      if (stream._pendingAbortRequest !== undefined) {
        return stream._pendingAbortRequest._promise;
      }
      let wasAlreadyErroring = false;
      if (state === "erroring") {
        wasAlreadyErroring = true;
        reason = undefined;
      }
      const promise = newPromise((resolve, reject) => {
        stream._pendingAbortRequest = {
          _promise: undefined,
          _resolve: resolve,
          _reject: reject,
          _reason: reason,
          _wasAlreadyErroring: wasAlreadyErroring
        };
      });
      stream._pendingAbortRequest._promise = promise;
      if (!wasAlreadyErroring) {
        WritableStreamStartErroring(stream, reason);
      }
      return promise;
    }
    function WritableStreamClose(stream) {
      const state = stream._state;
      if (state === "closed" || state === "errored") {
        return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
      }
      const promise = newPromise((resolve, reject) => {
        const closeRequest = {
          _resolve: resolve,
          _reject: reject
        };
        stream._closeRequest = closeRequest;
      });
      const writer = stream._writer;
      if (writer !== undefined && stream._backpressure && state === "writable") {
        defaultWriterReadyPromiseResolve(writer);
      }
      WritableStreamDefaultControllerClose(stream._writableStreamController);
      return promise;
    }
    function WritableStreamAddWriteRequest(stream) {
      const promise = newPromise((resolve, reject) => {
        const writeRequest = {
          _resolve: resolve,
          _reject: reject
        };
        stream._writeRequests.push(writeRequest);
      });
      return promise;
    }
    function WritableStreamDealWithRejection(stream, error) {
      const state = stream._state;
      if (state === "writable") {
        WritableStreamStartErroring(stream, error);
        return;
      }
      WritableStreamFinishErroring(stream);
    }
    function WritableStreamStartErroring(stream, reason) {
      const controller = stream._writableStreamController;
      stream._state = "erroring";
      stream._storedError = reason;
      const writer = stream._writer;
      if (writer !== undefined) {
        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
      }
      if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
        WritableStreamFinishErroring(stream);
      }
    }
    function WritableStreamFinishErroring(stream) {
      stream._state = "errored";
      stream._writableStreamController[ErrorSteps]();
      const storedError = stream._storedError;
      stream._writeRequests.forEach((writeRequest) => {
        writeRequest._reject(storedError);
      });
      stream._writeRequests = new SimpleQueue;
      if (stream._pendingAbortRequest === undefined) {
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
      }
      const abortRequest = stream._pendingAbortRequest;
      stream._pendingAbortRequest = undefined;
      if (abortRequest._wasAlreadyErroring) {
        abortRequest._reject(storedError);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
      }
      const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
      uponPromise(promise, () => {
        abortRequest._resolve();
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return null;
      }, (reason) => {
        abortRequest._reject(reason);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return null;
      });
    }
    function WritableStreamFinishInFlightWrite(stream) {
      stream._inFlightWriteRequest._resolve(undefined);
      stream._inFlightWriteRequest = undefined;
    }
    function WritableStreamFinishInFlightWriteWithError(stream, error) {
      stream._inFlightWriteRequest._reject(error);
      stream._inFlightWriteRequest = undefined;
      WritableStreamDealWithRejection(stream, error);
    }
    function WritableStreamFinishInFlightClose(stream) {
      stream._inFlightCloseRequest._resolve(undefined);
      stream._inFlightCloseRequest = undefined;
      const state = stream._state;
      if (state === "erroring") {
        stream._storedError = undefined;
        if (stream._pendingAbortRequest !== undefined) {
          stream._pendingAbortRequest._resolve();
          stream._pendingAbortRequest = undefined;
        }
      }
      stream._state = "closed";
      const writer = stream._writer;
      if (writer !== undefined) {
        defaultWriterClosedPromiseResolve(writer);
      }
    }
    function WritableStreamFinishInFlightCloseWithError(stream, error) {
      stream._inFlightCloseRequest._reject(error);
      stream._inFlightCloseRequest = undefined;
      if (stream._pendingAbortRequest !== undefined) {
        stream._pendingAbortRequest._reject(error);
        stream._pendingAbortRequest = undefined;
      }
      WritableStreamDealWithRejection(stream, error);
    }
    function WritableStreamCloseQueuedOrInFlight(stream) {
      if (stream._closeRequest === undefined && stream._inFlightCloseRequest === undefined) {
        return false;
      }
      return true;
    }
    function WritableStreamHasOperationMarkedInFlight(stream) {
      if (stream._inFlightWriteRequest === undefined && stream._inFlightCloseRequest === undefined) {
        return false;
      }
      return true;
    }
    function WritableStreamMarkCloseRequestInFlight(stream) {
      stream._inFlightCloseRequest = stream._closeRequest;
      stream._closeRequest = undefined;
    }
    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
      stream._inFlightWriteRequest = stream._writeRequests.shift();
    }
    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
      if (stream._closeRequest !== undefined) {
        stream._closeRequest._reject(stream._storedError);
        stream._closeRequest = undefined;
      }
      const writer = stream._writer;
      if (writer !== undefined) {
        defaultWriterClosedPromiseReject(writer, stream._storedError);
      }
    }
    function WritableStreamUpdateBackpressure(stream, backpressure) {
      const writer = stream._writer;
      if (writer !== undefined && backpressure !== stream._backpressure) {
        if (backpressure) {
          defaultWriterReadyPromiseReset(writer);
        } else {
          defaultWriterReadyPromiseResolve(writer);
        }
      }
      stream._backpressure = backpressure;
    }

    class WritableStreamDefaultWriter {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
        assertWritableStream(stream, "First parameter");
        if (IsWritableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive writing by another writer");
        }
        this._ownerWritableStream = stream;
        stream._writer = this;
        const state = stream._state;
        if (state === "writable") {
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
            defaultWriterReadyPromiseInitialize(this);
          } else {
            defaultWriterReadyPromiseInitializeAsResolved(this);
          }
          defaultWriterClosedPromiseInitialize(this);
        } else if (state === "erroring") {
          defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
          defaultWriterClosedPromiseInitialize(this);
        } else if (state === "closed") {
          defaultWriterReadyPromiseInitializeAsResolved(this);
          defaultWriterClosedPromiseInitializeAsResolved(this);
        } else {
          const storedError = stream._storedError;
          defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
          defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
        }
      }
      get closed() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      get desiredSize() {
        if (!IsWritableStreamDefaultWriter(this)) {
          throw defaultWriterBrandCheckException("desiredSize");
        }
        if (this._ownerWritableStream === undefined) {
          throw defaultWriterLockException("desiredSize");
        }
        return WritableStreamDefaultWriterGetDesiredSize(this);
      }
      get ready() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
        }
        return this._readyPromise;
      }
      abort(reason = undefined) {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
        }
        if (this._ownerWritableStream === undefined) {
          return promiseRejectedWith(defaultWriterLockException("abort"));
        }
        return WritableStreamDefaultWriterAbort(this, reason);
      }
      close() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("close"));
        }
        const stream = this._ownerWritableStream;
        if (stream === undefined) {
          return promiseRejectedWith(defaultWriterLockException("close"));
        }
        if (WritableStreamCloseQueuedOrInFlight(stream)) {
          return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
        }
        return WritableStreamDefaultWriterClose(this);
      }
      releaseLock() {
        if (!IsWritableStreamDefaultWriter(this)) {
          throw defaultWriterBrandCheckException("releaseLock");
        }
        const stream = this._ownerWritableStream;
        if (stream === undefined) {
          return;
        }
        WritableStreamDefaultWriterRelease(this);
      }
      write(chunk = undefined) {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("write"));
        }
        if (this._ownerWritableStream === undefined) {
          return promiseRejectedWith(defaultWriterLockException("write to"));
        }
        return WritableStreamDefaultWriterWrite(this, chunk);
      }
    }
    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
      abort: { enumerable: true },
      close: { enumerable: true },
      releaseLock: { enumerable: true },
      write: { enumerable: true },
      closed: { enumerable: true },
      desiredSize: { enumerable: true },
      ready: { enumerable: true }
    });
    setFunctionName(WritableStreamDefaultWriter.prototype.abort, "abort");
    setFunctionName(WritableStreamDefaultWriter.prototype.close, "close");
    setFunctionName(WritableStreamDefaultWriter.prototype.releaseLock, "releaseLock");
    setFunctionName(WritableStreamDefaultWriter.prototype.write, "write");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultWriter",
        configurable: true
      });
    }
    function IsWritableStreamDefaultWriter(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
        return false;
      }
      return x instanceof WritableStreamDefaultWriter;
    }
    function WritableStreamDefaultWriterAbort(writer, reason) {
      const stream = writer._ownerWritableStream;
      return WritableStreamAbort(stream, reason);
    }
    function WritableStreamDefaultWriterClose(writer) {
      const stream = writer._ownerWritableStream;
      return WritableStreamClose(stream);
    }
    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
      const stream = writer._ownerWritableStream;
      const state = stream._state;
      if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
        return promiseResolvedWith(undefined);
      }
      if (state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      return WritableStreamDefaultWriterClose(writer);
    }
    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
      if (writer._closedPromiseState === "pending") {
        defaultWriterClosedPromiseReject(writer, error);
      } else {
        defaultWriterClosedPromiseResetToRejected(writer, error);
      }
    }
    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
      if (writer._readyPromiseState === "pending") {
        defaultWriterReadyPromiseReject(writer, error);
      } else {
        defaultWriterReadyPromiseResetToRejected(writer, error);
      }
    }
    function WritableStreamDefaultWriterGetDesiredSize(writer) {
      const stream = writer._ownerWritableStream;
      const state = stream._state;
      if (state === "errored" || state === "erroring") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
    }
    function WritableStreamDefaultWriterRelease(writer) {
      const stream = writer._ownerWritableStream;
      const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
      WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
      WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
      stream._writer = undefined;
      writer._ownerWritableStream = undefined;
    }
    function WritableStreamDefaultWriterWrite(writer, chunk) {
      const stream = writer._ownerWritableStream;
      const controller = stream._writableStreamController;
      const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
      if (stream !== writer._ownerWritableStream) {
        return promiseRejectedWith(defaultWriterLockException("write to"));
      }
      const state = stream._state;
      if (state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
        return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
      }
      if (state === "erroring") {
        return promiseRejectedWith(stream._storedError);
      }
      const promise = WritableStreamAddWriteRequest(stream);
      WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
      return promise;
    }
    const closeSentinel = {};

    class WritableStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get abortReason() {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("abortReason");
        }
        return this._abortReason;
      }
      get signal() {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("signal");
        }
        if (this._abortController === undefined) {
          throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
        }
        return this._abortController.signal;
      }
      error(e = undefined) {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("error");
        }
        const state = this._controlledWritableStream._state;
        if (state !== "writable") {
          return;
        }
        WritableStreamDefaultControllerError(this, e);
      }
      [AbortSteps](reason) {
        const result = this._abortAlgorithm(reason);
        WritableStreamDefaultControllerClearAlgorithms(this);
        return result;
      }
      [ErrorSteps]() {
        ResetQueue(this);
      }
    }
    Object.defineProperties(WritableStreamDefaultController.prototype, {
      abortReason: { enumerable: true },
      signal: { enumerable: true },
      error: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultController",
        configurable: true
      });
    }
    function IsWritableStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
        return false;
      }
      return x instanceof WritableStreamDefaultController;
    }
    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
      controller._controlledWritableStream = stream;
      stream._writableStreamController = controller;
      controller._queue = undefined;
      controller._queueTotalSize = undefined;
      ResetQueue(controller);
      controller._abortReason = undefined;
      controller._abortController = createAbortController();
      controller._started = false;
      controller._strategySizeAlgorithm = sizeAlgorithm;
      controller._strategyHWM = highWaterMark;
      controller._writeAlgorithm = writeAlgorithm;
      controller._closeAlgorithm = closeAlgorithm;
      controller._abortAlgorithm = abortAlgorithm;
      const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
      WritableStreamUpdateBackpressure(stream, backpressure);
      const startResult = startAlgorithm();
      const startPromise = promiseResolvedWith(startResult);
      uponPromise(startPromise, () => {
        controller._started = true;
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        return null;
      }, (r) => {
        controller._started = true;
        WritableStreamDealWithRejection(stream, r);
        return null;
      });
    }
    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
      const controller = Object.create(WritableStreamDefaultController.prototype);
      let startAlgorithm;
      let writeAlgorithm;
      let closeAlgorithm;
      let abortAlgorithm;
      if (underlyingSink.start !== undefined) {
        startAlgorithm = () => underlyingSink.start(controller);
      } else {
        startAlgorithm = () => {
          return;
        };
      }
      if (underlyingSink.write !== undefined) {
        writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
      } else {
        writeAlgorithm = () => promiseResolvedWith(undefined);
      }
      if (underlyingSink.close !== undefined) {
        closeAlgorithm = () => underlyingSink.close();
      } else {
        closeAlgorithm = () => promiseResolvedWith(undefined);
      }
      if (underlyingSink.abort !== undefined) {
        abortAlgorithm = (reason) => underlyingSink.abort(reason);
      } else {
        abortAlgorithm = () => promiseResolvedWith(undefined);
      }
      SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
    }
    function WritableStreamDefaultControllerClearAlgorithms(controller) {
      controller._writeAlgorithm = undefined;
      controller._closeAlgorithm = undefined;
      controller._abortAlgorithm = undefined;
      controller._strategySizeAlgorithm = undefined;
    }
    function WritableStreamDefaultControllerClose(controller) {
      EnqueueValueWithSize(controller, closeSentinel, 0);
      WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
      try {
        return controller._strategySizeAlgorithm(chunk);
      } catch (chunkSizeE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
        return 1;
      }
    }
    function WritableStreamDefaultControllerGetDesiredSize(controller) {
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
      try {
        EnqueueValueWithSize(controller, chunk, chunkSize);
      } catch (enqueueE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
        return;
      }
      const stream = controller._controlledWritableStream;
      if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
        WritableStreamUpdateBackpressure(stream, backpressure);
      }
      WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
      const stream = controller._controlledWritableStream;
      if (!controller._started) {
        return;
      }
      if (stream._inFlightWriteRequest !== undefined) {
        return;
      }
      const state = stream._state;
      if (state === "erroring") {
        WritableStreamFinishErroring(stream);
        return;
      }
      if (controller._queue.length === 0) {
        return;
      }
      const value = PeekQueueValue(controller);
      if (value === closeSentinel) {
        WritableStreamDefaultControllerProcessClose(controller);
      } else {
        WritableStreamDefaultControllerProcessWrite(controller, value);
      }
    }
    function WritableStreamDefaultControllerErrorIfNeeded(controller, error) {
      if (controller._controlledWritableStream._state === "writable") {
        WritableStreamDefaultControllerError(controller, error);
      }
    }
    function WritableStreamDefaultControllerProcessClose(controller) {
      const stream = controller._controlledWritableStream;
      WritableStreamMarkCloseRequestInFlight(stream);
      DequeueValue(controller);
      const sinkClosePromise = controller._closeAlgorithm();
      WritableStreamDefaultControllerClearAlgorithms(controller);
      uponPromise(sinkClosePromise, () => {
        WritableStreamFinishInFlightClose(stream);
        return null;
      }, (reason) => {
        WritableStreamFinishInFlightCloseWithError(stream, reason);
        return null;
      });
    }
    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
      const stream = controller._controlledWritableStream;
      WritableStreamMarkFirstWriteRequestInFlight(stream);
      const sinkWritePromise = controller._writeAlgorithm(chunk);
      uponPromise(sinkWritePromise, () => {
        WritableStreamFinishInFlightWrite(stream);
        const state = stream._state;
        DequeueValue(controller);
        if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
        }
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        return null;
      }, (reason) => {
        if (stream._state === "writable") {
          WritableStreamDefaultControllerClearAlgorithms(controller);
        }
        WritableStreamFinishInFlightWriteWithError(stream, reason);
        return null;
      });
    }
    function WritableStreamDefaultControllerGetBackpressure(controller) {
      const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
      return desiredSize <= 0;
    }
    function WritableStreamDefaultControllerError(controller, error) {
      const stream = controller._controlledWritableStream;
      WritableStreamDefaultControllerClearAlgorithms(controller);
      WritableStreamStartErroring(stream, error);
    }
    function streamBrandCheckException$2(name) {
      return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
    }
    function defaultControllerBrandCheckException$2(name) {
      return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
    }
    function defaultWriterBrandCheckException(name) {
      return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
    }
    function defaultWriterLockException(name) {
      return new TypeError("Cannot " + name + " a stream using a released writer");
    }
    function defaultWriterClosedPromiseInitialize(writer) {
      writer._closedPromise = newPromise((resolve, reject) => {
        writer._closedPromise_resolve = resolve;
        writer._closedPromise_reject = reject;
        writer._closedPromiseState = "pending";
      });
    }
    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
      defaultWriterClosedPromiseInitialize(writer);
      defaultWriterClosedPromiseReject(writer, reason);
    }
    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
      defaultWriterClosedPromiseInitialize(writer);
      defaultWriterClosedPromiseResolve(writer);
    }
    function defaultWriterClosedPromiseReject(writer, reason) {
      if (writer._closedPromise_reject === undefined) {
        return;
      }
      setPromiseIsHandledToTrue(writer._closedPromise);
      writer._closedPromise_reject(reason);
      writer._closedPromise_resolve = undefined;
      writer._closedPromise_reject = undefined;
      writer._closedPromiseState = "rejected";
    }
    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
      defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterClosedPromiseResolve(writer) {
      if (writer._closedPromise_resolve === undefined) {
        return;
      }
      writer._closedPromise_resolve(undefined);
      writer._closedPromise_resolve = undefined;
      writer._closedPromise_reject = undefined;
      writer._closedPromiseState = "resolved";
    }
    function defaultWriterReadyPromiseInitialize(writer) {
      writer._readyPromise = newPromise((resolve, reject) => {
        writer._readyPromise_resolve = resolve;
        writer._readyPromise_reject = reject;
      });
      writer._readyPromiseState = "pending";
    }
    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
      defaultWriterReadyPromiseInitialize(writer);
      defaultWriterReadyPromiseReject(writer, reason);
    }
    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
      defaultWriterReadyPromiseInitialize(writer);
      defaultWriterReadyPromiseResolve(writer);
    }
    function defaultWriterReadyPromiseReject(writer, reason) {
      if (writer._readyPromise_reject === undefined) {
        return;
      }
      setPromiseIsHandledToTrue(writer._readyPromise);
      writer._readyPromise_reject(reason);
      writer._readyPromise_resolve = undefined;
      writer._readyPromise_reject = undefined;
      writer._readyPromiseState = "rejected";
    }
    function defaultWriterReadyPromiseReset(writer) {
      defaultWriterReadyPromiseInitialize(writer);
    }
    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
      defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterReadyPromiseResolve(writer) {
      if (writer._readyPromise_resolve === undefined) {
        return;
      }
      writer._readyPromise_resolve(undefined);
      writer._readyPromise_resolve = undefined;
      writer._readyPromise_reject = undefined;
      writer._readyPromiseState = "fulfilled";
    }
    function getGlobals() {
      if (typeof globalThis !== "undefined") {
        return globalThis;
      } else if (typeof self !== "undefined") {
        return self;
      } else if (typeof global !== "undefined") {
        return global;
      }
      return;
    }
    const globals = getGlobals();
    function isDOMExceptionConstructor(ctor) {
      if (!(typeof ctor === "function" || typeof ctor === "object")) {
        return false;
      }
      if (ctor.name !== "DOMException") {
        return false;
      }
      try {
        new ctor;
        return true;
      } catch (_a) {
        return false;
      }
    }
    function getFromGlobal() {
      const ctor = globals === null || globals === undefined ? undefined : globals.DOMException;
      return isDOMExceptionConstructor(ctor) ? ctor : undefined;
    }
    function createPolyfill() {
      const ctor = function DOMException(message, name) {
        this.message = message || "";
        this.name = name || "Error";
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      };
      setFunctionName(ctor, "DOMException");
      ctor.prototype = Object.create(Error.prototype);
      Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
      return ctor;
    }
    const DOMException = getFromGlobal() || createPolyfill();
    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
      const reader = AcquireReadableStreamDefaultReader(source);
      const writer = AcquireWritableStreamDefaultWriter(dest);
      source._disturbed = true;
      let shuttingDown = false;
      let currentWrite = promiseResolvedWith(undefined);
      return newPromise((resolve, reject) => {
        let abortAlgorithm;
        if (signal !== undefined) {
          abortAlgorithm = () => {
            const error = signal.reason !== undefined ? signal.reason : new DOMException("Aborted", "AbortError");
            const actions = [];
            if (!preventAbort) {
              actions.push(() => {
                if (dest._state === "writable") {
                  return WritableStreamAbort(dest, error);
                }
                return promiseResolvedWith(undefined);
              });
            }
            if (!preventCancel) {
              actions.push(() => {
                if (source._state === "readable") {
                  return ReadableStreamCancel(source, error);
                }
                return promiseResolvedWith(undefined);
              });
            }
            shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error);
          };
          if (signal.aborted) {
            abortAlgorithm();
            return;
          }
          signal.addEventListener("abort", abortAlgorithm);
        }
        function pipeLoop() {
          return newPromise((resolveLoop, rejectLoop) => {
            function next(done) {
              if (done) {
                resolveLoop();
              } else {
                PerformPromiseThen(pipeStep(), next, rejectLoop);
              }
            }
            next(false);
          });
        }
        function pipeStep() {
          if (shuttingDown) {
            return promiseResolvedWith(true);
          }
          return PerformPromiseThen(writer._readyPromise, () => {
            return newPromise((resolveRead, rejectRead) => {
              ReadableStreamDefaultReaderRead(reader, {
                _chunkSteps: (chunk) => {
                  currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), undefined, noop);
                  resolveRead(false);
                },
                _closeSteps: () => resolveRead(true),
                _errorSteps: rejectRead
              });
            });
          });
        }
        isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
          if (!preventAbort) {
            shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
          } else {
            shutdown(true, storedError);
          }
          return null;
        });
        isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
          if (!preventCancel) {
            shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
          } else {
            shutdown(true, storedError);
          }
          return null;
        });
        isOrBecomesClosed(source, reader._closedPromise, () => {
          if (!preventClose) {
            shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
          } else {
            shutdown();
          }
          return null;
        });
        if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
          const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
          if (!preventCancel) {
            shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
          } else {
            shutdown(true, destClosed);
          }
        }
        setPromiseIsHandledToTrue(pipeLoop());
        function waitForWritesToFinish() {
          const oldCurrentWrite = currentWrite;
          return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined);
        }
        function isOrBecomesErrored(stream, promise, action) {
          if (stream._state === "errored") {
            action(stream._storedError);
          } else {
            uponRejection(promise, action);
          }
        }
        function isOrBecomesClosed(stream, promise, action) {
          if (stream._state === "closed") {
            action();
          } else {
            uponFulfillment(promise, action);
          }
        }
        function shutdownWithAction(action, originalIsError, originalError) {
          if (shuttingDown) {
            return;
          }
          shuttingDown = true;
          if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
            uponFulfillment(waitForWritesToFinish(), doTheRest);
          } else {
            doTheRest();
          }
          function doTheRest() {
            uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
            return null;
          }
        }
        function shutdown(isError, error) {
          if (shuttingDown) {
            return;
          }
          shuttingDown = true;
          if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
            uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error));
          } else {
            finalize(isError, error);
          }
        }
        function finalize(isError, error) {
          WritableStreamDefaultWriterRelease(writer);
          ReadableStreamReaderGenericRelease(reader);
          if (signal !== undefined) {
            signal.removeEventListener("abort", abortAlgorithm);
          }
          if (isError) {
            reject(error);
          } else {
            resolve(undefined);
          }
          return null;
        }
      });
    }

    class ReadableStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get desiredSize() {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("desiredSize");
        }
        return ReadableStreamDefaultControllerGetDesiredSize(this);
      }
      close() {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("close");
        }
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
          throw new TypeError("The stream is not in a state that permits close");
        }
        ReadableStreamDefaultControllerClose(this);
      }
      enqueue(chunk = undefined) {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("enqueue");
        }
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
          throw new TypeError("The stream is not in a state that permits enqueue");
        }
        return ReadableStreamDefaultControllerEnqueue(this, chunk);
      }
      error(e = undefined) {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("error");
        }
        ReadableStreamDefaultControllerError(this, e);
      }
      [CancelSteps](reason) {
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableStreamDefaultControllerClearAlgorithms(this);
        return result;
      }
      [PullSteps](readRequest) {
        const stream = this._controlledReadableStream;
        if (this._queue.length > 0) {
          const chunk = DequeueValue(this);
          if (this._closeRequested && this._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(this);
            ReadableStreamClose(stream);
          } else {
            ReadableStreamDefaultControllerCallPullIfNeeded(this);
          }
          readRequest._chunkSteps(chunk);
        } else {
          ReadableStreamAddReadRequest(stream, readRequest);
          ReadableStreamDefaultControllerCallPullIfNeeded(this);
        }
      }
      [ReleaseSteps]() {
      }
    }
    Object.defineProperties(ReadableStreamDefaultController.prototype, {
      close: { enumerable: true },
      enqueue: { enumerable: true },
      error: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    setFunctionName(ReadableStreamDefaultController.prototype.close, "close");
    setFunctionName(ReadableStreamDefaultController.prototype.enqueue, "enqueue");
    setFunctionName(ReadableStreamDefaultController.prototype.error, "error");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultController",
        configurable: true
      });
    }
    function IsReadableStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
        return false;
      }
      return x instanceof ReadableStreamDefaultController;
    }
    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
      const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
      if (!shouldPull) {
        return;
      }
      if (controller._pulling) {
        controller._pullAgain = true;
        return;
      }
      controller._pulling = true;
      const pullPromise = controller._pullAlgorithm();
      uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain) {
          controller._pullAgain = false;
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        return null;
      }, (e) => {
        ReadableStreamDefaultControllerError(controller, e);
        return null;
      });
    }
    function ReadableStreamDefaultControllerShouldCallPull(controller) {
      const stream = controller._controlledReadableStream;
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return false;
      }
      if (!controller._started) {
        return false;
      }
      if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
      }
      const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
      if (desiredSize > 0) {
        return true;
      }
      return false;
    }
    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
      controller._pullAlgorithm = undefined;
      controller._cancelAlgorithm = undefined;
      controller._strategySizeAlgorithm = undefined;
    }
    function ReadableStreamDefaultControllerClose(controller) {
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return;
      }
      const stream = controller._controlledReadableStream;
      controller._closeRequested = true;
      if (controller._queue.length === 0) {
        ReadableStreamDefaultControllerClearAlgorithms(controller);
        ReadableStreamClose(stream);
      }
    }
    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return;
      }
      const stream = controller._controlledReadableStream;
      if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        ReadableStreamFulfillReadRequest(stream, chunk, false);
      } else {
        let chunkSize;
        try {
          chunkSize = controller._strategySizeAlgorithm(chunk);
        } catch (chunkSizeE) {
          ReadableStreamDefaultControllerError(controller, chunkSizeE);
          throw chunkSizeE;
        }
        try {
          EnqueueValueWithSize(controller, chunk, chunkSize);
        } catch (enqueueE) {
          ReadableStreamDefaultControllerError(controller, enqueueE);
          throw enqueueE;
        }
      }
      ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }
    function ReadableStreamDefaultControllerError(controller, e) {
      const stream = controller._controlledReadableStream;
      if (stream._state !== "readable") {
        return;
      }
      ResetQueue(controller);
      ReadableStreamDefaultControllerClearAlgorithms(controller);
      ReadableStreamError(stream, e);
    }
    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
      const state = controller._controlledReadableStream._state;
      if (state === "errored") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableStreamDefaultControllerHasBackpressure(controller) {
      if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
        return false;
      }
      return true;
    }
    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
      const state = controller._controlledReadableStream._state;
      if (!controller._closeRequested && state === "readable") {
        return true;
      }
      return false;
    }
    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
      controller._controlledReadableStream = stream;
      controller._queue = undefined;
      controller._queueTotalSize = undefined;
      ResetQueue(controller);
      controller._started = false;
      controller._closeRequested = false;
      controller._pullAgain = false;
      controller._pulling = false;
      controller._strategySizeAlgorithm = sizeAlgorithm;
      controller._strategyHWM = highWaterMark;
      controller._pullAlgorithm = pullAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      stream._readableStreamController = controller;
      const startResult = startAlgorithm();
      uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        return null;
      }, (r) => {
        ReadableStreamDefaultControllerError(controller, r);
        return null;
      });
    }
    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
      const controller = Object.create(ReadableStreamDefaultController.prototype);
      let startAlgorithm;
      let pullAlgorithm;
      let cancelAlgorithm;
      if (underlyingSource.start !== undefined) {
        startAlgorithm = () => underlyingSource.start(controller);
      } else {
        startAlgorithm = () => {
          return;
        };
      }
      if (underlyingSource.pull !== undefined) {
        pullAlgorithm = () => underlyingSource.pull(controller);
      } else {
        pullAlgorithm = () => promiseResolvedWith(undefined);
      }
      if (underlyingSource.cancel !== undefined) {
        cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
      } else {
        cancelAlgorithm = () => promiseResolvedWith(undefined);
      }
      SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
    }
    function defaultControllerBrandCheckException$1(name) {
      return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
    }
    function ReadableStreamTee(stream, cloneForBranch2) {
      if (IsReadableByteStreamController(stream._readableStreamController)) {
        return ReadableByteStreamTee(stream);
      }
      return ReadableStreamDefaultTee(stream);
    }
    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
      const reader = AcquireReadableStreamDefaultReader(stream);
      let reading = false;
      let readAgain = false;
      let canceled1 = false;
      let canceled2 = false;
      let reason1;
      let reason2;
      let branch1;
      let branch2;
      let resolveCancelPromise;
      const cancelPromise = newPromise((resolve) => {
        resolveCancelPromise = resolve;
      });
      function pullAlgorithm() {
        if (reading) {
          readAgain = true;
          return promiseResolvedWith(undefined);
        }
        reading = true;
        const readRequest = {
          _chunkSteps: (chunk) => {
            _queueMicrotask(() => {
              readAgain = false;
              const chunk1 = chunk;
              const chunk2 = chunk;
              if (!canceled1) {
                ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
              }
              if (!canceled2) {
                ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
              }
              reading = false;
              if (readAgain) {
                pullAlgorithm();
              }
            });
          },
          _closeSteps: () => {
            reading = false;
            if (!canceled1) {
              ReadableStreamDefaultControllerClose(branch1._readableStreamController);
            }
            if (!canceled2) {
              ReadableStreamDefaultControllerClose(branch2._readableStreamController);
            }
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(undefined);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
        return promiseResolvedWith(undefined);
      }
      function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function startAlgorithm() {
      }
      branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
      branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
      uponRejection(reader._closedPromise, (r) => {
        ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
        ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
        if (!canceled1 || !canceled2) {
          resolveCancelPromise(undefined);
        }
        return null;
      });
      return [branch1, branch2];
    }
    function ReadableByteStreamTee(stream) {
      let reader = AcquireReadableStreamDefaultReader(stream);
      let reading = false;
      let readAgainForBranch1 = false;
      let readAgainForBranch2 = false;
      let canceled1 = false;
      let canceled2 = false;
      let reason1;
      let reason2;
      let branch1;
      let branch2;
      let resolveCancelPromise;
      const cancelPromise = newPromise((resolve) => {
        resolveCancelPromise = resolve;
      });
      function forwardReaderError(thisReader) {
        uponRejection(thisReader._closedPromise, (r) => {
          if (thisReader !== reader) {
            return null;
          }
          ReadableByteStreamControllerError(branch1._readableStreamController, r);
          ReadableByteStreamControllerError(branch2._readableStreamController, r);
          if (!canceled1 || !canceled2) {
            resolveCancelPromise(undefined);
          }
          return null;
        });
      }
      function pullWithDefaultReader() {
        if (IsReadableStreamBYOBReader(reader)) {
          ReadableStreamReaderGenericRelease(reader);
          reader = AcquireReadableStreamDefaultReader(stream);
          forwardReaderError(reader);
        }
        const readRequest = {
          _chunkSteps: (chunk) => {
            _queueMicrotask(() => {
              readAgainForBranch1 = false;
              readAgainForBranch2 = false;
              const chunk1 = chunk;
              let chunk2 = chunk;
              if (!canceled1 && !canceled2) {
                try {
                  chunk2 = CloneAsUint8Array(chunk);
                } catch (cloneE) {
                  ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                  ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                  resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                  return;
                }
              }
              if (!canceled1) {
                ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
              }
              if (!canceled2) {
                ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
              }
              reading = false;
              if (readAgainForBranch1) {
                pull1Algorithm();
              } else if (readAgainForBranch2) {
                pull2Algorithm();
              }
            });
          },
          _closeSteps: () => {
            reading = false;
            if (!canceled1) {
              ReadableByteStreamControllerClose(branch1._readableStreamController);
            }
            if (!canceled2) {
              ReadableByteStreamControllerClose(branch2._readableStreamController);
            }
            if (branch1._readableStreamController._pendingPullIntos.length > 0) {
              ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
            }
            if (branch2._readableStreamController._pendingPullIntos.length > 0) {
              ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
            }
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(undefined);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
      }
      function pullWithBYOBReader(view, forBranch2) {
        if (IsReadableStreamDefaultReader(reader)) {
          ReadableStreamReaderGenericRelease(reader);
          reader = AcquireReadableStreamBYOBReader(stream);
          forwardReaderError(reader);
        }
        const byobBranch = forBranch2 ? branch2 : branch1;
        const otherBranch = forBranch2 ? branch1 : branch2;
        const readIntoRequest = {
          _chunkSteps: (chunk) => {
            _queueMicrotask(() => {
              readAgainForBranch1 = false;
              readAgainForBranch2 = false;
              const byobCanceled = forBranch2 ? canceled2 : canceled1;
              const otherCanceled = forBranch2 ? canceled1 : canceled2;
              if (!otherCanceled) {
                let clonedChunk;
                try {
                  clonedChunk = CloneAsUint8Array(chunk);
                } catch (cloneE) {
                  ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                  ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                  resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                  return;
                }
                if (!byobCanceled) {
                  ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                }
                ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
              } else if (!byobCanceled) {
                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
              }
              reading = false;
              if (readAgainForBranch1) {
                pull1Algorithm();
              } else if (readAgainForBranch2) {
                pull2Algorithm();
              }
            });
          },
          _closeSteps: (chunk) => {
            reading = false;
            const byobCanceled = forBranch2 ? canceled2 : canceled1;
            const otherCanceled = forBranch2 ? canceled1 : canceled2;
            if (!byobCanceled) {
              ReadableByteStreamControllerClose(byobBranch._readableStreamController);
            }
            if (!otherCanceled) {
              ReadableByteStreamControllerClose(otherBranch._readableStreamController);
            }
            if (chunk !== undefined) {
              if (!byobCanceled) {
                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
              }
              if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
              }
            }
            if (!byobCanceled || !otherCanceled) {
              resolveCancelPromise(undefined);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamBYOBReaderRead(reader, view, 1, readIntoRequest);
      }
      function pull1Algorithm() {
        if (reading) {
          readAgainForBranch1 = true;
          return promiseResolvedWith(undefined);
        }
        reading = true;
        const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
        if (byobRequest === null) {
          pullWithDefaultReader();
        } else {
          pullWithBYOBReader(byobRequest._view, false);
        }
        return promiseResolvedWith(undefined);
      }
      function pull2Algorithm() {
        if (reading) {
          readAgainForBranch2 = true;
          return promiseResolvedWith(undefined);
        }
        reading = true;
        const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
        if (byobRequest === null) {
          pullWithDefaultReader();
        } else {
          pullWithBYOBReader(byobRequest._view, true);
        }
        return promiseResolvedWith(undefined);
      }
      function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function startAlgorithm() {
        return;
      }
      branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
      branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
      forwardReaderError(reader);
      return [branch1, branch2];
    }
    function isReadableStreamLike(stream) {
      return typeIsObject(stream) && typeof stream.getReader !== "undefined";
    }
    function ReadableStreamFrom(source) {
      if (isReadableStreamLike(source)) {
        return ReadableStreamFromDefaultReader(source.getReader());
      }
      return ReadableStreamFromIterable(source);
    }
    function ReadableStreamFromIterable(asyncIterable) {
      let stream;
      const iteratorRecord = GetIterator(asyncIterable, "async");
      const startAlgorithm = noop;
      function pullAlgorithm() {
        let nextResult;
        try {
          nextResult = IteratorNext(iteratorRecord);
        } catch (e) {
          return promiseRejectedWith(e);
        }
        const nextPromise = promiseResolvedWith(nextResult);
        return transformPromiseWith(nextPromise, (iterResult) => {
          if (!typeIsObject(iterResult)) {
            throw new TypeError("The promise returned by the iterator.next() method must fulfill with an object");
          }
          const done = IteratorComplete(iterResult);
          if (done) {
            ReadableStreamDefaultControllerClose(stream._readableStreamController);
          } else {
            const value = IteratorValue(iterResult);
            ReadableStreamDefaultControllerEnqueue(stream._readableStreamController, value);
          }
        });
      }
      function cancelAlgorithm(reason) {
        const iterator = iteratorRecord.iterator;
        let returnMethod;
        try {
          returnMethod = GetMethod(iterator, "return");
        } catch (e) {
          return promiseRejectedWith(e);
        }
        if (returnMethod === undefined) {
          return promiseResolvedWith(undefined);
        }
        let returnResult;
        try {
          returnResult = reflectCall(returnMethod, iterator, [reason]);
        } catch (e) {
          return promiseRejectedWith(e);
        }
        const returnPromise = promiseResolvedWith(returnResult);
        return transformPromiseWith(returnPromise, (iterResult) => {
          if (!typeIsObject(iterResult)) {
            throw new TypeError("The promise returned by the iterator.return() method must fulfill with an object");
          }
          return;
        });
      }
      stream = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, 0);
      return stream;
    }
    function ReadableStreamFromDefaultReader(reader) {
      let stream;
      const startAlgorithm = noop;
      function pullAlgorithm() {
        let readPromise;
        try {
          readPromise = reader.read();
        } catch (e) {
          return promiseRejectedWith(e);
        }
        return transformPromiseWith(readPromise, (readResult) => {
          if (!typeIsObject(readResult)) {
            throw new TypeError("The promise returned by the reader.read() method must fulfill with an object");
          }
          if (readResult.done) {
            ReadableStreamDefaultControllerClose(stream._readableStreamController);
          } else {
            const value = readResult.value;
            ReadableStreamDefaultControllerEnqueue(stream._readableStreamController, value);
          }
        });
      }
      function cancelAlgorithm(reason) {
        try {
          return promiseResolvedWith(reader.cancel(reason));
        } catch (e) {
          return promiseRejectedWith(e);
        }
      }
      stream = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, 0);
      return stream;
    }
    function convertUnderlyingDefaultOrByteSource(source, context) {
      assertDictionary(source, context);
      const original = source;
      const autoAllocateChunkSize = original === null || original === undefined ? undefined : original.autoAllocateChunkSize;
      const cancel = original === null || original === undefined ? undefined : original.cancel;
      const pull = original === null || original === undefined ? undefined : original.pull;
      const start = original === null || original === undefined ? undefined : original.start;
      const type = original === null || original === undefined ? undefined : original.type;
      return {
        autoAllocateChunkSize: autoAllocateChunkSize === undefined ? undefined : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
        cancel: cancel === undefined ? undefined : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
        pull: pull === undefined ? undefined : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
        start: start === undefined ? undefined : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
        type: type === undefined ? undefined : convertReadableStreamType(type, `${context} has member 'type' that`)
      };
    }
    function convertUnderlyingSourceCancelCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSourcePullCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertUnderlyingSourceStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertReadableStreamType(type, context) {
      type = `${type}`;
      if (type !== "bytes") {
        throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
      }
      return type;
    }
    function convertIteratorOptions(options, context) {
      assertDictionary(options, context);
      const preventCancel = options === null || options === undefined ? undefined : options.preventCancel;
      return { preventCancel: Boolean(preventCancel) };
    }
    function convertPipeOptions(options, context) {
      assertDictionary(options, context);
      const preventAbort = options === null || options === undefined ? undefined : options.preventAbort;
      const preventCancel = options === null || options === undefined ? undefined : options.preventCancel;
      const preventClose = options === null || options === undefined ? undefined : options.preventClose;
      const signal = options === null || options === undefined ? undefined : options.signal;
      if (signal !== undefined) {
        assertAbortSignal(signal, `${context} has member 'signal' that`);
      }
      return {
        preventAbort: Boolean(preventAbort),
        preventCancel: Boolean(preventCancel),
        preventClose: Boolean(preventClose),
        signal
      };
    }
    function assertAbortSignal(signal, context) {
      if (!isAbortSignal(signal)) {
        throw new TypeError(`${context} is not an AbortSignal.`);
      }
    }
    function convertReadableWritablePair(pair, context) {
      assertDictionary(pair, context);
      const readable = pair === null || pair === undefined ? undefined : pair.readable;
      assertRequiredField(readable, "readable", "ReadableWritablePair");
      assertReadableStream(readable, `${context} has member 'readable' that`);
      const writable = pair === null || pair === undefined ? undefined : pair.writable;
      assertRequiredField(writable, "writable", "ReadableWritablePair");
      assertWritableStream(writable, `${context} has member 'writable' that`);
      return { readable, writable };
    }

    class ReadableStream2 {
      constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
        if (rawUnderlyingSource === undefined) {
          rawUnderlyingSource = null;
        } else {
          assertObject(rawUnderlyingSource, "First parameter");
        }
        const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
        const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
        InitializeReadableStream(this);
        if (underlyingSource.type === "bytes") {
          if (strategy.size !== undefined) {
            throw new RangeError("The strategy for a byte stream cannot have a size function");
          }
          const highWaterMark = ExtractHighWaterMark(strategy, 0);
          SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
        } else {
          const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
          const highWaterMark = ExtractHighWaterMark(strategy, 1);
          SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
        }
      }
      get locked() {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("locked");
        }
        return IsReadableStreamLocked(this);
      }
      cancel(reason = undefined) {
        if (!IsReadableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$1("cancel"));
        }
        if (IsReadableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
        }
        return ReadableStreamCancel(this, reason);
      }
      getReader(rawOptions = undefined) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("getReader");
        }
        const options = convertReaderOptions(rawOptions, "First parameter");
        if (options.mode === undefined) {
          return AcquireReadableStreamDefaultReader(this);
        }
        return AcquireReadableStreamBYOBReader(this);
      }
      pipeThrough(rawTransform, rawOptions = {}) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("pipeThrough");
        }
        assertRequiredArgument(rawTransform, 1, "pipeThrough");
        const transform = convertReadableWritablePair(rawTransform, "First parameter");
        const options = convertPipeOptions(rawOptions, "Second parameter");
        if (IsReadableStreamLocked(this)) {
          throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
        }
        if (IsWritableStreamLocked(transform.writable)) {
          throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
        }
        const promise = ReadableStreamPipeTo(this, transform.writable, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
        setPromiseIsHandledToTrue(promise);
        return transform.readable;
      }
      pipeTo(destination, rawOptions = {}) {
        if (!IsReadableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
        }
        if (destination === undefined) {
          return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
        }
        if (!IsWritableStream(destination)) {
          return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
        }
        let options;
        try {
          options = convertPipeOptions(rawOptions, "Second parameter");
        } catch (e) {
          return promiseRejectedWith(e);
        }
        if (IsReadableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
        }
        if (IsWritableStreamLocked(destination)) {
          return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
        }
        return ReadableStreamPipeTo(this, destination, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
      }
      tee() {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("tee");
        }
        const branches = ReadableStreamTee(this);
        return CreateArrayFromList(branches);
      }
      values(rawOptions = undefined) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("values");
        }
        const options = convertIteratorOptions(rawOptions, "First parameter");
        return AcquireReadableStreamAsyncIterator(this, options.preventCancel);
      }
      static from(asyncIterable) {
        return ReadableStreamFrom(asyncIterable);
      }
    }
    Object.defineProperties(ReadableStream2, {
      from: { enumerable: true }
    });
    Object.defineProperties(ReadableStream2.prototype, {
      cancel: { enumerable: true },
      getReader: { enumerable: true },
      pipeThrough: { enumerable: true },
      pipeTo: { enumerable: true },
      tee: { enumerable: true },
      values: { enumerable: true },
      locked: { enumerable: true }
    });
    setFunctionName(ReadableStream2.from, "from");
    setFunctionName(ReadableStream2.prototype.cancel, "cancel");
    setFunctionName(ReadableStream2.prototype.getReader, "getReader");
    setFunctionName(ReadableStream2.prototype.pipeThrough, "pipeThrough");
    setFunctionName(ReadableStream2.prototype.pipeTo, "pipeTo");
    setFunctionName(ReadableStream2.prototype.tee, "tee");
    setFunctionName(ReadableStream2.prototype.values, "values");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStream",
        configurable: true
      });
    }
    if (typeof SymbolPolyfill.asyncIterator === "symbol") {
      Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
        value: ReadableStream2.prototype.values,
        writable: true,
        configurable: true
      });
    }
    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
      const stream = Object.create(ReadableStream2.prototype);
      InitializeReadableStream(stream);
      const controller = Object.create(ReadableStreamDefaultController.prototype);
      SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
      return stream;
    }
    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
      const stream = Object.create(ReadableStream2.prototype);
      InitializeReadableStream(stream);
      const controller = Object.create(ReadableByteStreamController.prototype);
      SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, undefined);
      return stream;
    }
    function InitializeReadableStream(stream) {
      stream._state = "readable";
      stream._reader = undefined;
      stream._storedError = undefined;
      stream._disturbed = false;
    }
    function IsReadableStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
        return false;
      }
      return x instanceof ReadableStream2;
    }
    function IsReadableStreamLocked(stream) {
      if (stream._reader === undefined) {
        return false;
      }
      return true;
    }
    function ReadableStreamCancel(stream, reason) {
      stream._disturbed = true;
      if (stream._state === "closed") {
        return promiseResolvedWith(undefined);
      }
      if (stream._state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      ReadableStreamClose(stream);
      const reader = stream._reader;
      if (reader !== undefined && IsReadableStreamBYOBReader(reader)) {
        const readIntoRequests = reader._readIntoRequests;
        reader._readIntoRequests = new SimpleQueue;
        readIntoRequests.forEach((readIntoRequest) => {
          readIntoRequest._closeSteps(undefined);
        });
      }
      const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
      return transformPromiseWith(sourceCancelPromise, noop);
    }
    function ReadableStreamClose(stream) {
      stream._state = "closed";
      const reader = stream._reader;
      if (reader === undefined) {
        return;
      }
      defaultReaderClosedPromiseResolve(reader);
      if (IsReadableStreamDefaultReader(reader)) {
        const readRequests = reader._readRequests;
        reader._readRequests = new SimpleQueue;
        readRequests.forEach((readRequest) => {
          readRequest._closeSteps();
        });
      }
    }
    function ReadableStreamError(stream, e) {
      stream._state = "errored";
      stream._storedError = e;
      const reader = stream._reader;
      if (reader === undefined) {
        return;
      }
      defaultReaderClosedPromiseReject(reader, e);
      if (IsReadableStreamDefaultReader(reader)) {
        ReadableStreamDefaultReaderErrorReadRequests(reader, e);
      } else {
        ReadableStreamBYOBReaderErrorReadIntoRequests(reader, e);
      }
    }
    function streamBrandCheckException$1(name) {
      return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
    }
    function convertQueuingStrategyInit(init, context) {
      assertDictionary(init, context);
      const highWaterMark = init === null || init === undefined ? undefined : init.highWaterMark;
      assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
      return {
        highWaterMark: convertUnrestrictedDouble(highWaterMark)
      };
    }
    const byteLengthSizeFunction = (chunk) => {
      return chunk.byteLength;
    };
    setFunctionName(byteLengthSizeFunction, "size");

    class ByteLengthQueuingStrategy {
      constructor(options) {
        assertRequiredArgument(options, 1, "ByteLengthQueuingStrategy");
        options = convertQueuingStrategyInit(options, "First parameter");
        this._byteLengthQueuingStrategyHighWaterMark = options.highWaterMark;
      }
      get highWaterMark() {
        if (!IsByteLengthQueuingStrategy(this)) {
          throw byteLengthBrandCheckException("highWaterMark");
        }
        return this._byteLengthQueuingStrategyHighWaterMark;
      }
      get size() {
        if (!IsByteLengthQueuingStrategy(this)) {
          throw byteLengthBrandCheckException("size");
        }
        return byteLengthSizeFunction;
      }
    }
    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
      highWaterMark: { enumerable: true },
      size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "ByteLengthQueuingStrategy",
        configurable: true
      });
    }
    function byteLengthBrandCheckException(name) {
      return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
    }
    function IsByteLengthQueuingStrategy(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
        return false;
      }
      return x instanceof ByteLengthQueuingStrategy;
    }
    const countSizeFunction = () => {
      return 1;
    };
    setFunctionName(countSizeFunction, "size");

    class CountQueuingStrategy {
      constructor(options) {
        assertRequiredArgument(options, 1, "CountQueuingStrategy");
        options = convertQueuingStrategyInit(options, "First parameter");
        this._countQueuingStrategyHighWaterMark = options.highWaterMark;
      }
      get highWaterMark() {
        if (!IsCountQueuingStrategy(this)) {
          throw countBrandCheckException("highWaterMark");
        }
        return this._countQueuingStrategyHighWaterMark;
      }
      get size() {
        if (!IsCountQueuingStrategy(this)) {
          throw countBrandCheckException("size");
        }
        return countSizeFunction;
      }
    }
    Object.defineProperties(CountQueuingStrategy.prototype, {
      highWaterMark: { enumerable: true },
      size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "CountQueuingStrategy",
        configurable: true
      });
    }
    function countBrandCheckException(name) {
      return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
    }
    function IsCountQueuingStrategy(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
        return false;
      }
      return x instanceof CountQueuingStrategy;
    }
    function convertTransformer(original, context) {
      assertDictionary(original, context);
      const cancel = original === null || original === undefined ? undefined : original.cancel;
      const flush = original === null || original === undefined ? undefined : original.flush;
      const readableType = original === null || original === undefined ? undefined : original.readableType;
      const start = original === null || original === undefined ? undefined : original.start;
      const transform = original === null || original === undefined ? undefined : original.transform;
      const writableType = original === null || original === undefined ? undefined : original.writableType;
      return {
        cancel: cancel === undefined ? undefined : convertTransformerCancelCallback(cancel, original, `${context} has member 'cancel' that`),
        flush: flush === undefined ? undefined : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
        readableType,
        start: start === undefined ? undefined : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
        transform: transform === undefined ? undefined : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
        writableType
      };
    }
    function convertTransformerFlushCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertTransformerStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertTransformerTransformCallback(fn, original, context) {
      assertFunction(fn, context);
      return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }
    function convertTransformerCancelCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }

    class TransformStream {
      constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
        if (rawTransformer === undefined) {
          rawTransformer = null;
        }
        const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
        const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
        const transformer = convertTransformer(rawTransformer, "First parameter");
        if (transformer.readableType !== undefined) {
          throw new RangeError("Invalid readableType specified");
        }
        if (transformer.writableType !== undefined) {
          throw new RangeError("Invalid writableType specified");
        }
        const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
        const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
        const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
        const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
        let startPromise_resolve;
        const startPromise = newPromise((resolve) => {
          startPromise_resolve = resolve;
        });
        InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
        SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
        if (transformer.start !== undefined) {
          startPromise_resolve(transformer.start(this._transformStreamController));
        } else {
          startPromise_resolve(undefined);
        }
      }
      get readable() {
        if (!IsTransformStream(this)) {
          throw streamBrandCheckException("readable");
        }
        return this._readable;
      }
      get writable() {
        if (!IsTransformStream(this)) {
          throw streamBrandCheckException("writable");
        }
        return this._writable;
      }
    }
    Object.defineProperties(TransformStream.prototype, {
      readable: { enumerable: true },
      writable: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStream",
        configurable: true
      });
    }
    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
      function startAlgorithm() {
        return startPromise;
      }
      function writeAlgorithm(chunk) {
        return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
      }
      function abortAlgorithm(reason) {
        return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
      }
      function closeAlgorithm() {
        return TransformStreamDefaultSinkCloseAlgorithm(stream);
      }
      stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
      function pullAlgorithm() {
        return TransformStreamDefaultSourcePullAlgorithm(stream);
      }
      function cancelAlgorithm(reason) {
        return TransformStreamDefaultSourceCancelAlgorithm(stream, reason);
      }
      stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
      stream._backpressure = undefined;
      stream._backpressureChangePromise = undefined;
      stream._backpressureChangePromise_resolve = undefined;
      TransformStreamSetBackpressure(stream, true);
      stream._transformStreamController = undefined;
    }
    function IsTransformStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
        return false;
      }
      return x instanceof TransformStream;
    }
    function TransformStreamError(stream, e) {
      ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
      TransformStreamErrorWritableAndUnblockWrite(stream, e);
    }
    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
      TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
      WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
      TransformStreamUnblockWrite(stream);
    }
    function TransformStreamUnblockWrite(stream) {
      if (stream._backpressure) {
        TransformStreamSetBackpressure(stream, false);
      }
    }
    function TransformStreamSetBackpressure(stream, backpressure) {
      if (stream._backpressureChangePromise !== undefined) {
        stream._backpressureChangePromise_resolve();
      }
      stream._backpressureChangePromise = newPromise((resolve) => {
        stream._backpressureChangePromise_resolve = resolve;
      });
      stream._backpressure = backpressure;
    }

    class TransformStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get desiredSize() {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("desiredSize");
        }
        const readableController = this._controlledTransformStream._readable._readableStreamController;
        return ReadableStreamDefaultControllerGetDesiredSize(readableController);
      }
      enqueue(chunk = undefined) {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("enqueue");
        }
        TransformStreamDefaultControllerEnqueue(this, chunk);
      }
      error(reason = undefined) {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("error");
        }
        TransformStreamDefaultControllerError(this, reason);
      }
      terminate() {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("terminate");
        }
        TransformStreamDefaultControllerTerminate(this);
      }
    }
    Object.defineProperties(TransformStreamDefaultController.prototype, {
      enqueue: { enumerable: true },
      error: { enumerable: true },
      terminate: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    setFunctionName(TransformStreamDefaultController.prototype.enqueue, "enqueue");
    setFunctionName(TransformStreamDefaultController.prototype.error, "error");
    setFunctionName(TransformStreamDefaultController.prototype.terminate, "terminate");
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStreamDefaultController",
        configurable: true
      });
    }
    function IsTransformStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
        return false;
      }
      return x instanceof TransformStreamDefaultController;
    }
    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm, cancelAlgorithm) {
      controller._controlledTransformStream = stream;
      stream._transformStreamController = controller;
      controller._transformAlgorithm = transformAlgorithm;
      controller._flushAlgorithm = flushAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      controller._finishPromise = undefined;
      controller._finishPromise_resolve = undefined;
      controller._finishPromise_reject = undefined;
    }
    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
      const controller = Object.create(TransformStreamDefaultController.prototype);
      let transformAlgorithm;
      let flushAlgorithm;
      let cancelAlgorithm;
      if (transformer.transform !== undefined) {
        transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
      } else {
        transformAlgorithm = (chunk) => {
          try {
            TransformStreamDefaultControllerEnqueue(controller, chunk);
            return promiseResolvedWith(undefined);
          } catch (transformResultE) {
            return promiseRejectedWith(transformResultE);
          }
        };
      }
      if (transformer.flush !== undefined) {
        flushAlgorithm = () => transformer.flush(controller);
      } else {
        flushAlgorithm = () => promiseResolvedWith(undefined);
      }
      if (transformer.cancel !== undefined) {
        cancelAlgorithm = (reason) => transformer.cancel(reason);
      } else {
        cancelAlgorithm = () => promiseResolvedWith(undefined);
      }
      SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm, cancelAlgorithm);
    }
    function TransformStreamDefaultControllerClearAlgorithms(controller) {
      controller._transformAlgorithm = undefined;
      controller._flushAlgorithm = undefined;
      controller._cancelAlgorithm = undefined;
    }
    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
      const stream = controller._controlledTransformStream;
      const readableController = stream._readable._readableStreamController;
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
        throw new TypeError("Readable side is not in a state that permits enqueue");
      }
      try {
        ReadableStreamDefaultControllerEnqueue(readableController, chunk);
      } catch (e) {
        TransformStreamErrorWritableAndUnblockWrite(stream, e);
        throw stream._readable._storedError;
      }
      const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
      if (backpressure !== stream._backpressure) {
        TransformStreamSetBackpressure(stream, true);
      }
    }
    function TransformStreamDefaultControllerError(controller, e) {
      TransformStreamError(controller._controlledTransformStream, e);
    }
    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
      const transformPromise = controller._transformAlgorithm(chunk);
      return transformPromiseWith(transformPromise, undefined, (r) => {
        TransformStreamError(controller._controlledTransformStream, r);
        throw r;
      });
    }
    function TransformStreamDefaultControllerTerminate(controller) {
      const stream = controller._controlledTransformStream;
      const readableController = stream._readable._readableStreamController;
      ReadableStreamDefaultControllerClose(readableController);
      const error = new TypeError("TransformStream terminated");
      TransformStreamErrorWritableAndUnblockWrite(stream, error);
    }
    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
      const controller = stream._transformStreamController;
      if (stream._backpressure) {
        const backpressureChangePromise = stream._backpressureChangePromise;
        return transformPromiseWith(backpressureChangePromise, () => {
          const writable = stream._writable;
          const state = writable._state;
          if (state === "erroring") {
            throw writable._storedError;
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        });
      }
      return TransformStreamDefaultControllerPerformTransform(controller, chunk);
    }
    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
      const controller = stream._transformStreamController;
      if (controller._finishPromise !== undefined) {
        return controller._finishPromise;
      }
      const readable = stream._readable;
      controller._finishPromise = newPromise((resolve, reject) => {
        controller._finishPromise_resolve = resolve;
        controller._finishPromise_reject = reject;
      });
      const cancelPromise = controller._cancelAlgorithm(reason);
      TransformStreamDefaultControllerClearAlgorithms(controller);
      uponPromise(cancelPromise, () => {
        if (readable._state === "errored") {
          defaultControllerFinishPromiseReject(controller, readable._storedError);
        } else {
          ReadableStreamDefaultControllerError(readable._readableStreamController, reason);
          defaultControllerFinishPromiseResolve(controller);
        }
        return null;
      }, (r) => {
        ReadableStreamDefaultControllerError(readable._readableStreamController, r);
        defaultControllerFinishPromiseReject(controller, r);
        return null;
      });
      return controller._finishPromise;
    }
    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
      const controller = stream._transformStreamController;
      if (controller._finishPromise !== undefined) {
        return controller._finishPromise;
      }
      const readable = stream._readable;
      controller._finishPromise = newPromise((resolve, reject) => {
        controller._finishPromise_resolve = resolve;
        controller._finishPromise_reject = reject;
      });
      const flushPromise = controller._flushAlgorithm();
      TransformStreamDefaultControllerClearAlgorithms(controller);
      uponPromise(flushPromise, () => {
        if (readable._state === "errored") {
          defaultControllerFinishPromiseReject(controller, readable._storedError);
        } else {
          ReadableStreamDefaultControllerClose(readable._readableStreamController);
          defaultControllerFinishPromiseResolve(controller);
        }
        return null;
      }, (r) => {
        ReadableStreamDefaultControllerError(readable._readableStreamController, r);
        defaultControllerFinishPromiseReject(controller, r);
        return null;
      });
      return controller._finishPromise;
    }
    function TransformStreamDefaultSourcePullAlgorithm(stream) {
      TransformStreamSetBackpressure(stream, false);
      return stream._backpressureChangePromise;
    }
    function TransformStreamDefaultSourceCancelAlgorithm(stream, reason) {
      const controller = stream._transformStreamController;
      if (controller._finishPromise !== undefined) {
        return controller._finishPromise;
      }
      const writable = stream._writable;
      controller._finishPromise = newPromise((resolve, reject) => {
        controller._finishPromise_resolve = resolve;
        controller._finishPromise_reject = reject;
      });
      const cancelPromise = controller._cancelAlgorithm(reason);
      TransformStreamDefaultControllerClearAlgorithms(controller);
      uponPromise(cancelPromise, () => {
        if (writable._state === "errored") {
          defaultControllerFinishPromiseReject(controller, writable._storedError);
        } else {
          WritableStreamDefaultControllerErrorIfNeeded(writable._writableStreamController, reason);
          TransformStreamUnblockWrite(stream);
          defaultControllerFinishPromiseResolve(controller);
        }
        return null;
      }, (r) => {
        WritableStreamDefaultControllerErrorIfNeeded(writable._writableStreamController, r);
        TransformStreamUnblockWrite(stream);
        defaultControllerFinishPromiseReject(controller, r);
        return null;
      });
      return controller._finishPromise;
    }
    function defaultControllerBrandCheckException(name) {
      return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
    }
    function defaultControllerFinishPromiseResolve(controller) {
      if (controller._finishPromise_resolve === undefined) {
        return;
      }
      controller._finishPromise_resolve();
      controller._finishPromise_resolve = undefined;
      controller._finishPromise_reject = undefined;
    }
    function defaultControllerFinishPromiseReject(controller, reason) {
      if (controller._finishPromise_reject === undefined) {
        return;
      }
      setPromiseIsHandledToTrue(controller._finishPromise);
      controller._finishPromise_reject(reason);
      controller._finishPromise_resolve = undefined;
      controller._finishPromise_reject = undefined;
    }
    function streamBrandCheckException(name) {
      return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
    }
    exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports2.CountQueuingStrategy = CountQueuingStrategy;
    exports2.ReadableByteStreamController = ReadableByteStreamController;
    exports2.ReadableStream = ReadableStream2;
    exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
    exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
    exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    exports2.TransformStream = TransformStream;
    exports2.TransformStreamDefaultController = TransformStreamDefaultController;
    exports2.WritableStream = WritableStream;
    exports2.WritableStreamDefaultController = WritableStreamDefaultController;
    exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
  });
});

// node_modules/fetch-blob/streams.cjs
var require_streams = __commonJS(() => {
  var POOL_SIZE = 65536;
  if (!globalThis.ReadableStream) {
    try {
      const process2 = __require("node:process");
      const { emitWarning } = process2;
      try {
        process2.emitWarning = () => {
        };
        Object.assign(globalThis, __require("node:stream/web"));
        process2.emitWarning = emitWarning;
      } catch (error) {
        process2.emitWarning = emitWarning;
        throw error;
      }
    } catch (error) {
      Object.assign(globalThis, require_ponyfill_es2018());
    }
  }
  try {
    const { Blob } = __require("buffer");
    if (Blob && !Blob.prototype.stream) {
      Blob.prototype.stream = function name(params) {
        let position = 0;
        const blob = this;
        return new ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE));
            const buffer = await chunk.arrayBuffer();
            position += buffer.byteLength;
            ctrl.enqueue(new Uint8Array(buffer));
            if (position === blob.size) {
              ctrl.close();
            }
          }
        });
      };
    }
  } catch (error) {
  }
});

// node_modules/fetch-blob/index.js
async function* toIterator(parts, clone = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0, b = part;
      while (position !== b.size) {
        const chunk = b.slice(position, Math.min(b.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
var streams, POOL_SIZE, _Blob, Blob2, fetch_blob_default;
var init_fetch_blob = __esm(() => {
  streams = __toESM(require_streams(), 1);
  /*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
  POOL_SIZE = 65536;
  _Blob = class Blob {
    #parts = [];
    #type = "";
    #size = 0;
    #endings = "transparent";
    constructor(blobParts = [], options = {}) {
      if (typeof blobParts !== "object" || blobParts === null) {
        throw new TypeError("Failed to construct \'Blob\': The provided value cannot be converted to a sequence.");
      }
      if (typeof blobParts[Symbol.iterator] !== "function") {
        throw new TypeError("Failed to construct \'Blob\': The object must have a callable @@iterator property.");
      }
      if (typeof options !== "object" && typeof options !== "function") {
        throw new TypeError("Failed to construct \'Blob\': parameter 2 cannot convert to dictionary.");
      }
      if (options === null)
        options = {};
      const encoder = new TextEncoder;
      for (const element of blobParts) {
        let part;
        if (ArrayBuffer.isView(element)) {
          part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
        } else if (element instanceof ArrayBuffer) {
          part = new Uint8Array(element.slice(0));
        } else if (element instanceof Blob) {
          part = element;
        } else {
          part = encoder.encode(`${element}`);
        }
        this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
        this.#parts.push(part);
      }
      this.#endings = `${options.endings === undefined ? "transparent" : options.endings}`;
      const type = options.type === undefined ? "" : String(options.type);
      this.#type = /^[\x20-\x7E]*$/.test(type) ? type : "";
    }
    get size() {
      return this.#size;
    }
    get type() {
      return this.#type;
    }
    async text() {
      const decoder = new TextDecoder;
      let str = "";
      for await (const part of toIterator(this.#parts, false)) {
        str += decoder.decode(part, { stream: true });
      }
      str += decoder.decode();
      return str;
    }
    async arrayBuffer() {
      const data = new Uint8Array(this.size);
      let offset = 0;
      for await (const chunk of toIterator(this.#parts, false)) {
        data.set(chunk, offset);
        offset += chunk.length;
      }
      return data.buffer;
    }
    stream() {
      const it = toIterator(this.#parts, true);
      return new globalThis.ReadableStream({
        type: "bytes",
        async pull(ctrl) {
          const chunk = await it.next();
          chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
        },
        async cancel() {
          await it.return();
        }
      });
    }
    slice(start = 0, end = this.size, type = "") {
      const { size } = this;
      let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
      let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
      const span = Math.max(relativeEnd - relativeStart, 0);
      const parts = this.#parts;
      const blobParts = [];
      let added = 0;
      for (const part of parts) {
        if (added >= span) {
          break;
        }
        const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
        if (relativeStart && size2 <= relativeStart) {
          relativeStart -= size2;
          relativeEnd -= size2;
        } else {
          let chunk;
          if (ArrayBuffer.isView(part)) {
            chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
            added += chunk.byteLength;
          } else {
            chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            added += chunk.size;
          }
          relativeEnd -= size2;
          blobParts.push(chunk);
          relativeStart = 0;
        }
      }
      const blob = new Blob([], { type: String(type).toLowerCase() });
      blob.#size = span;
      blob.#parts = blobParts;
      return blob;
    }
    get [Symbol.toStringTag]() {
      return "Blob";
    }
    static [Symbol.hasInstance](object) {
      return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
    }
  };
  Object.defineProperties(_Blob.prototype, {
    size: { enumerable: true },
    type: { enumerable: true },
    slice: { enumerable: true }
  });
  Blob2 = _Blob;
  fetch_blob_default = Blob2;
});

// node_modules/fetch-blob/file.js
var _File, File2, file_default;
var init_file = __esm(() => {
  init_fetch_blob();
  _File = class File extends fetch_blob_default {
    #lastModified = 0;
    #name = "";
    constructor(fileBits, fileName, options = {}) {
      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`);
      }
      super(fileBits, options);
      if (options === null)
        options = {};
      const lastModified = options.lastModified === undefined ? Date.now() : Number(options.lastModified);
      if (!Number.isNaN(lastModified)) {
        this.#lastModified = lastModified;
      }
      this.#name = String(fileName);
    }
    get name() {
      return this.#name;
    }
    get lastModified() {
      return this.#lastModified;
    }
    get [Symbol.toStringTag]() {
      return "File";
    }
    static [Symbol.hasInstance](object) {
      return !!object && object instanceof fetch_blob_default && /^(File)$/.test(object[Symbol.toStringTag]);
    }
  };
  File2 = _File;
  file_default = File2;
});

// node_modules/formdata-polyfill/esm.min.js
function formDataToBlob(F, B = fetch_blob_default) {
  var b = `${r()}${r()}`.replace(/\./g, "").slice(-28).padStart(32, "-"), c = [], p = `--${b}\r\nContent-Disposition: form-data; name="`;
  F.forEach((v, n) => typeof v == "string" ? c.push(p + e(n) + `"\r\n\r\n${v.replace(/\r(?!\n)|(?<!\r)\n/g, "\r\n")}\r\n`) : c.push(p + e(n) + `"; filename="${e(v.name, 1)}"\r\nContent-Type: ${v.type || "application/octet-stream"}\r\n\r\n`, v, "\r\n"));
  c.push(`--${b}--`);
  return new B(c, { type: "multipart/form-data; boundary=" + b });
}
var t, i, h, r, m, f, e, x, FormData;
var init_esm_min = __esm(() => {
  init_fetch_blob();
  init_file();
  /*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
  ({ toStringTag: t, iterator: i, hasInstance: h } = Symbol);
  r = Math.random;
  m = "append,set,get,getAll,delete,keys,values,entries,forEach,constructor".split(",");
  f = (a, b, c) => (a += "", /^(Blob|File)$/.test(b && b[t]) ? [(c = c !== undefined ? c + "" : b[t] == "File" ? b.name : "blob", a), b.name !== c || b[t] == "blob" ? new file_default([b], c, b) : b] : [a, b + ""]);
  e = (c, f2) => (f2 ? c : c.replace(/\r?\n|\r/g, "\r\n")).replace(/\n/g, "%0A").replace(/\r/g, "%0D").replace(/"/g, "%22");
  x = (n, a, e2) => {
    if (a.length < e2) {
      throw new TypeError(`Failed to execute '${n}' on 'FormData': ${e2} arguments required, but only ${a.length} present.`);
    }
  };
  FormData = class FormData2 {
    #d = [];
    constructor(...a) {
      if (a.length)
        throw new TypeError(`Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.`);
    }
    get [t]() {
      return "FormData";
    }
    [i]() {
      return this.entries();
    }
    static [h](o) {
      return o && typeof o === "object" && o[t] === "FormData" && !m.some((m2) => typeof o[m2] != "function");
    }
    append(...a) {
      x("append", arguments, 2);
      this.#d.push(f(...a));
    }
    delete(a) {
      x("delete", arguments, 1);
      a += "";
      this.#d = this.#d.filter(([b]) => b !== a);
    }
    get(a) {
      x("get", arguments, 1);
      a += "";
      for (var b = this.#d, l = b.length, c = 0;c < l; c++)
        if (b[c][0] === a)
          return b[c][1];
      return null;
    }
    getAll(a, b) {
      x("getAll", arguments, 1);
      b = [];
      a += "";
      this.#d.forEach((c) => c[0] === a && b.push(c[1]));
      return b;
    }
    has(a) {
      x("has", arguments, 1);
      a += "";
      return this.#d.some((b) => b[0] === a);
    }
    forEach(a, b) {
      x("forEach", arguments, 1);
      for (var [c, d] of this)
        a.call(b, d, c, this);
    }
    set(...a) {
      x("set", arguments, 2);
      var b = [], c = true;
      a = f(...a);
      this.#d.forEach((d) => {
        d[0] === a[0] ? c && (c = !b.push(a)) : b.push(d);
      });
      c && b.push(a);
      this.#d = b;
    }
    *entries() {
      yield* this.#d;
    }
    *keys() {
      for (var [a] of this)
        yield a;
    }
    *values() {
      for (var [, a] of this)
        yield a;
    }
  };
});

// node_modules/node-domexception/index.js
var require_node_domexception = __commonJS((exports, module) => {
  /*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
  if (!globalThis.DOMException) {
    try {
      const { MessageChannel } = __require("worker_threads"), port = new MessageChannel().port1, ab = new ArrayBuffer;
      port.postMessage(ab, [ab, ab]);
    } catch (err) {
      err.constructor.name === "DOMException" && (globalThis.DOMException = err.constructor);
    }
  }
  module.exports = globalThis.DOMException;
});

// node_modules/fetch-blob/from.js
import {statSync, createReadStream, promises as fs} from "node:fs";

class BlobDataItem {
  #path;
  #start;
  constructor(options) {
    this.#path = options.path;
    this.#start = options.start;
    this.size = options.size;
    this.lastModified = options.lastModified;
  }
  slice(start, end) {
    return new BlobDataItem({
      path: this.#path,
      lastModified: this.lastModified,
      size: end - start,
      start: this.#start + start
    });
  }
  async* stream() {
    const { mtimeMs } = await stat(this.#path);
    if (mtimeMs > this.lastModified) {
      throw new import_node_domexception.default("The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.", "NotReadableError");
    }
    yield* createReadStream(this.#path, {
      start: this.#start,
      end: this.#start + this.size - 1
    });
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
}
var import_node_domexception, stat;
var init_from = __esm(() => {
  import_node_domexception = __toESM(require_node_domexception(), 1);
  init_file();
  init_fetch_blob();
  ({ stat } = fs);
});

// node_modules/node-fetch/src/utils/multipart-parser.js
var exports_multipart_parser = {};
__export(exports_multipart_parser, {
  toFormData: () => {
    {
      return toFormData;
    }
  }
});
async function toFormData(Body, ct) {
  if (!/multipart/i.test(ct)) {
    throw new TypeError("Failed to fetch");
  }
  const m2 = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!m2) {
    throw new TypeError("no or bad content-type header, no multipart boundary");
  }
  const parser = new MultipartParser(m2[1] || m2[2]);
  let headerField;
  let headerValue;
  let entryValue;
  let entryName;
  let contentType;
  let filename;
  const entryChunks = [];
  const formData = new FormData;
  const onPartData = (ui8a) => {
    entryValue += decoder.decode(ui8a, { stream: true });
  };
  const appendToFile = (ui8a) => {
    entryChunks.push(ui8a);
  };
  const appendFileToFormData = () => {
    const file3 = new file_default(entryChunks, filename, { type: contentType });
    formData.append(entryName, file3);
  };
  const appendEntryToFormData = () => {
    formData.append(entryName, entryValue);
  };
  const decoder = new TextDecoder("utf-8");
  decoder.decode();
  parser.onPartBegin = function() {
    parser.onPartData = onPartData;
    parser.onPartEnd = appendEntryToFormData;
    headerField = "";
    headerValue = "";
    entryValue = "";
    entryName = "";
    contentType = "";
    filename = null;
    entryChunks.length = 0;
  };
  parser.onHeaderField = function(ui8a) {
    headerField += decoder.decode(ui8a, { stream: true });
  };
  parser.onHeaderValue = function(ui8a) {
    headerValue += decoder.decode(ui8a, { stream: true });
  };
  parser.onHeaderEnd = function() {
    headerValue += decoder.decode();
    headerField = headerField.toLowerCase();
    if (headerField === "content-disposition") {
      const m3 = headerValue.match(/\bname=("([^"]*)"|([^()<>@,;:\\"/[\]?={}\s\t]+))/i);
      if (m3) {
        entryName = m3[2] || m3[3] || "";
      }
      filename = _fileName(headerValue);
      if (filename) {
        parser.onPartData = appendToFile;
        parser.onPartEnd = appendFileToFormData;
      }
    } else if (headerField === "content-type") {
      contentType = headerValue;
    }
    headerValue = "";
    headerField = "";
  };
  for await (const chunk of Body) {
    parser.write(chunk);
  }
  parser.end();
  return formData;
}

class MultipartParser {
  constructor(boundary) {
    this.index = 0;
    this.flags = 0;
    this.onHeaderEnd = noop;
    this.onHeaderField = noop;
    this.onHeadersEnd = noop;
    this.onHeaderValue = noop;
    this.onPartBegin = noop;
    this.onPartData = noop;
    this.onPartEnd = noop;
    this.boundaryChars = {};
    boundary = "\r\n--" + boundary;
    const ui8a = new Uint8Array(boundary.length);
    for (let i2 = 0;i2 < boundary.length; i2++) {
      ui8a[i2] = boundary.charCodeAt(i2);
      this.boundaryChars[ui8a[i2]] = true;
    }
    this.boundary = ui8a;
    this.lookbehind = new Uint8Array(this.boundary.length + 8);
    this.state = S.START_BOUNDARY;
  }
  write(data) {
    let i2 = 0;
    const length_ = data.length;
    let previousIndex = this.index;
    let { lookbehind, boundary, boundaryChars, index, state, flags } = this;
    const boundaryLength = this.boundary.length;
    const boundaryEnd = boundaryLength - 1;
    const bufferLength = data.length;
    let c;
    let cl;
    const mark = (name) => {
      this[name + "Mark"] = i2;
    };
    const clear = (name) => {
      delete this[name + "Mark"];
    };
    const callback = (callbackSymbol, start, end, ui8a) => {
      if (start === undefined || start !== end) {
        this[callbackSymbol](ui8a && ui8a.subarray(start, end));
      }
    };
    const dataCallback = (name, clear2) => {
      const markSymbol = name + "Mark";
      if (!(markSymbol in this)) {
        return;
      }
      if (clear2) {
        callback(name, this[markSymbol], i2, data);
        delete this[markSymbol];
      } else {
        callback(name, this[markSymbol], data.length, data);
        this[markSymbol] = 0;
      }
    };
    for (i2 = 0;i2 < length_; i2++) {
      c = data[i2];
      switch (state) {
        case S.START_BOUNDARY:
          if (index === boundary.length - 2) {
            if (c === HYPHEN) {
              flags |= F.LAST_BOUNDARY;
            } else if (c !== CR) {
              return;
            }
            index++;
            break;
          } else if (index - 1 === boundary.length - 2) {
            if (flags & F.LAST_BOUNDARY && c === HYPHEN) {
              state = S.END;
              flags = 0;
            } else if (!(flags & F.LAST_BOUNDARY) && c === LF) {
              index = 0;
              callback("onPartBegin");
              state = S.HEADER_FIELD_START;
            } else {
              return;
            }
            break;
          }
          if (c !== boundary[index + 2]) {
            index = -2;
          }
          if (c === boundary[index + 2]) {
            index++;
          }
          break;
        case S.HEADER_FIELD_START:
          state = S.HEADER_FIELD;
          mark("onHeaderField");
          index = 0;
        case S.HEADER_FIELD:
          if (c === CR) {
            clear("onHeaderField");
            state = S.HEADERS_ALMOST_DONE;
            break;
          }
          index++;
          if (c === HYPHEN) {
            break;
          }
          if (c === COLON) {
            if (index === 1) {
              return;
            }
            dataCallback("onHeaderField", true);
            state = S.HEADER_VALUE_START;
            break;
          }
          cl = lower(c);
          if (cl < A || cl > Z) {
            return;
          }
          break;
        case S.HEADER_VALUE_START:
          if (c === SPACE) {
            break;
          }
          mark("onHeaderValue");
          state = S.HEADER_VALUE;
        case S.HEADER_VALUE:
          if (c === CR) {
            dataCallback("onHeaderValue", true);
            callback("onHeaderEnd");
            state = S.HEADER_VALUE_ALMOST_DONE;
          }
          break;
        case S.HEADER_VALUE_ALMOST_DONE:
          if (c !== LF) {
            return;
          }
          state = S.HEADER_FIELD_START;
          break;
        case S.HEADERS_ALMOST_DONE:
          if (c !== LF) {
            return;
          }
          callback("onHeadersEnd");
          state = S.PART_DATA_START;
          break;
        case S.PART_DATA_START:
          state = S.PART_DATA;
          mark("onPartData");
        case S.PART_DATA:
          previousIndex = index;
          if (index === 0) {
            i2 += boundaryEnd;
            while (i2 < bufferLength && !(data[i2] in boundaryChars)) {
              i2 += boundaryLength;
            }
            i2 -= boundaryEnd;
            c = data[i2];
          }
          if (index < boundary.length) {
            if (boundary[index] === c) {
              if (index === 0) {
                dataCallback("onPartData", true);
              }
              index++;
            } else {
              index = 0;
            }
          } else if (index === boundary.length) {
            index++;
            if (c === CR) {
              flags |= F.PART_BOUNDARY;
            } else if (c === HYPHEN) {
              flags |= F.LAST_BOUNDARY;
            } else {
              index = 0;
            }
          } else if (index - 1 === boundary.length) {
            if (flags & F.PART_BOUNDARY) {
              index = 0;
              if (c === LF) {
                flags &= ~F.PART_BOUNDARY;
                callback("onPartEnd");
                callback("onPartBegin");
                state = S.HEADER_FIELD_START;
                break;
              }
            } else if (flags & F.LAST_BOUNDARY) {
              if (c === HYPHEN) {
                callback("onPartEnd");
                state = S.END;
                flags = 0;
              } else {
                index = 0;
              }
            } else {
              index = 0;
            }
          }
          if (index > 0) {
            lookbehind[index - 1] = c;
          } else if (previousIndex > 0) {
            const _lookbehind = new Uint8Array(lookbehind.buffer, lookbehind.byteOffset, lookbehind.byteLength);
            callback("onPartData", 0, previousIndex, _lookbehind);
            previousIndex = 0;
            mark("onPartData");
            i2--;
          }
          break;
        case S.END:
          break;
        default:
          throw new Error(`Unexpected state entered: ${state}`);
      }
    }
    dataCallback("onHeaderField");
    dataCallback("onHeaderValue");
    dataCallback("onPartData");
    this.index = index;
    this.state = state;
    this.flags = flags;
  }
  end() {
    if (this.state === S.HEADER_FIELD_START && this.index === 0 || this.state === S.PART_DATA && this.index === this.boundary.length) {
      this.onPartEnd();
    } else if (this.state !== S.END) {
      throw new Error("MultipartParser.end(): stream ended unexpectedly");
    }
  }
}
var _fileName, s, S, f2, F, LF, CR, SPACE, HYPHEN, COLON, A, Z, lower, noop;
var init_multipart_parser = __esm(() => {
  init_from();
  init_esm_min();
  _fileName = function(headerValue) {
    const m2 = headerValue.match(/\bfilename=("(.*?)"|([^()<>@,;:\\"/[\]?={}\s\t]+))($|;\s)/i);
    if (!m2) {
      return;
    }
    const match = m2[2] || m2[3] || "";
    let filename = match.slice(match.lastIndexOf("\\") + 1);
    filename = filename.replace(/%22/g, '"');
    filename = filename.replace(/&#(\d{4});/g, (m3, code) => {
      return String.fromCharCode(code);
    });
    return filename;
  };
  s = 0;
  S = {
    START_BOUNDARY: s++,
    HEADER_FIELD_START: s++,
    HEADER_FIELD: s++,
    HEADER_VALUE_START: s++,
    HEADER_VALUE: s++,
    HEADER_VALUE_ALMOST_DONE: s++,
    HEADERS_ALMOST_DONE: s++,
    PART_DATA_START: s++,
    PART_DATA: s++,
    END: s++
  };
  f2 = 1;
  F = {
    PART_BOUNDARY: f2,
    LAST_BOUNDARY: f2 *= 2
  };
  LF = 10;
  CR = 13;
  SPACE = 32;
  HYPHEN = 45;
  COLON = 58;
  A = 97;
  Z = 122;
  lower = (c) => c | 32;
  noop = () => {
  };
});

// lib/index.ts
import {join} from "path";

// lib/request.ts
var import_abort_controller = __toESM(require_abort_controller(), 1);

// node_modules/node-fetch/src/index.js
import http2 from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import Stream2, {PassThrough as PassThrough2, pipeline as pump} from "node:stream";
import {Buffer as Buffer3} from "node:buffer";

// node_modules/data-uri-to-buffer/dist/index.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1;i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else if (meta[i]) {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var dist_default = dataUriToBuffer;

// node_modules/node-fetch/src/body.js
init_fetch_blob();
init_esm_min();
import Stream, {PassThrough} from "node:stream";
import {types, deprecate, promisify} from "node:util";
import {Buffer as Buffer2} from "node:buffer";

// node_modules/node-fetch/src/errors/base.js
class FetchBaseError extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
}

// node_modules/node-fetch/src/errors/fetch-error.js
class FetchError extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
}

// node_modules/node-fetch/src/utils/is.js
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return object && typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
var isAbortSignal = (object) => {
  return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
};
var isDomainOrSubdomain = (destination, original) => {
  const orig = new URL(original).hostname;
  const dest = new URL(destination).hostname;
  return orig === dest || orig.endsWith(`.${dest}`);
};
var isSameProtocol = (destination, original) => {
  const orig = new URL(original).protocol;
  const dest = new URL(destination).protocol;
  return orig === dest;
};

// node_modules/node-fetch/src/body.js
async function consumeBody(data) {
  if (data[INTERNALS].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS].disturbed = true;
  if (data[INTERNALS].error) {
    throw data[INTERNALS].error;
  }
  const { body } = data;
  if (body === null) {
    return Buffer2.alloc(0);
  }
  if (!(body instanceof Stream)) {
    return Buffer2.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error);
        throw error;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error) {
    const error_ = error instanceof FetchBaseError ? error : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, "system", error);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer2.from(accum.join(""));
      }
      return Buffer2.concat(accum, accumBytes);
    } catch (error) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, "system", error);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var pipeline = promisify(Stream.pipeline);
var INTERNALS = Symbol("Body internals");

class Body {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer2.from(body.toString());
    } else if (isBlob(body)) {
    } else if (Buffer2.isBuffer(body)) {
    } else if (types.isAnyArrayBuffer(body)) {
      body = Buffer2.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer2.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof Stream) {
    } else if (body instanceof FormData) {
      body = formDataToBlob(body);
      boundary = body.type.split("=")[1];
    } else {
      body = Buffer2.from(String(body));
    }
    let stream = body;
    if (Buffer2.isBuffer(body)) {
      stream = Stream.Readable.from(body);
    } else if (isBlob(body)) {
      stream = Stream.Readable.from(body.stream());
    }
    this[INTERNALS] = {
      body,
      stream,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof Stream) {
      body.on("error", (error_) => {
        const error = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
        this[INTERNALS].error = error;
      });
    }
  }
  get body() {
    return this[INTERNALS].stream;
  }
  get bodyUsed() {
    return this[INTERNALS].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async formData() {
    const ct = this.headers.get("content-type");
    if (ct.startsWith("application/x-www-form-urlencoded")) {
      const formData = new FormData;
      const parameters = new URLSearchParams(await this.text());
      for (const [name, value] of parameters) {
        formData.append(name, value);
      }
      return formData;
    }
    const { toFormData: toFormData2 } = await Promise.resolve().then(() => (init_multipart_parser(), exports_multipart_parser));
    return toFormData2(this.body, ct);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS].body && this[INTERNALS].body.type || "";
    const buf = await this.arrayBuffer();
    return new fetch_blob_default([buf], {
      type: ct
    });
  }
  async json() {
    const text = await this.text();
    return JSON.parse(text);
  }
  async text() {
    const buffer = await consumeBody(this);
    return new TextDecoder().decode(buffer);
  }
  buffer() {
    return consumeBody(this);
  }
}
Body.prototype.buffer = deprecate(Body.prototype.buffer, "Please use \'response.arrayBuffer()\' instead of \'response.buffer()\'", "node-fetch#buffer");
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true },
  data: { get: deprecate(() => {
  }, "data doesn\'t exist, use json(), text(), arrayBuffer(), or body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (response)") }
});
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance[INTERNALS];
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof Stream && typeof body.getBoundary !== "function") {
    p1 = new PassThrough({ highWaterMark });
    p2 = new PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS].stream = p1;
    body = p2;
  }
  return body;
};
var getNonSpecFormDataBoundary = deprecate((body) => body.getBoundary(), "form-data doesn\'t follow the spec and requires special treatment. Use alternative package", "https://github.com/node-fetch/node-fetch/issues/1167");
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer2.isBuffer(body) || types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body instanceof FormData) {
    return `multipart/form-data; boundary=${request[INTERNALS].boundary}`;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${getNonSpecFormDataBoundary(body)}`;
  }
  if (body instanceof Stream) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request[INTERNALS];
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer2.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  return null;
};
var writeToStream = async (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else {
    await pipeline(body, dest);
  }
};

// node_modules/node-fetch/src/headers.js
import {types as types2} from "node:util";
import http from "node:http";
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var validateHeaderName = typeof http.validateHeaderName === "function" ? http.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const error = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(error, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw error;
  }
};
var validateHeaderValue = typeof http.validateHeaderValue === "function" ? http.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const error = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(error, "code", { value: "ERR_INVALID_CHAR" });
    throw error;
  }
};

class Headers extends URLSearchParams {
  constructor(init) {
    let result = [];
    if (init instanceof Headers) {
      const raw = init.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init == null) {
    } else if (typeof init === "object" && !types2.isBoxedPrimitive(init)) {
      const method = init[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init].map((pair) => {
          if (typeof pair !== "object" || types2.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct \'Headers\': The provided value is not of type \'(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : undefined;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback, thisArg = undefined) {
    for (const name of this.keys()) {
      Reflect.apply(callback, thisArg, [this.get(name), name, this]);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
}
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));

// node_modules/node-fetch/src/utils/is-redirect.js
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};

// node_modules/node-fetch/src/response.js
var INTERNALS2 = Symbol("Response internals");

class Response extends Body {
  constructor(body2 = null, options = {}) {
    super(body2, options);
    const status = options.status != null ? options.status : 200;
    const headers2 = new Headers(options.headers);
    if (body2 !== null && !headers2.has("Content-Type")) {
      const contentType = extractContentType(body2, this);
      if (contentType) {
        headers2.append("Content-Type", contentType);
      }
    }
    this[INTERNALS2] = {
      type: "default",
      url: options.url,
      status,
      statusText: options.statusText || "",
      headers: headers2,
      counter: options.counter,
      highWaterMark: options.highWaterMark
    };
  }
  get type() {
    return this[INTERNALS2].type;
  }
  get url() {
    return this[INTERNALS2].url || "";
  }
  get status() {
    return this[INTERNALS2].status;
  }
  get ok() {
    return this[INTERNALS2].status >= 200 && this[INTERNALS2].status < 300;
  }
  get redirected() {
    return this[INTERNALS2].counter > 0;
  }
  get statusText() {
    return this[INTERNALS2].statusText;
  }
  get headers() {
    return this[INTERNALS2].headers;
  }
  get highWaterMark() {
    return this[INTERNALS2].highWaterMark;
  }
  clone() {
    return new Response(clone(this, this.highWaterMark), {
      type: this.type,
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size,
      highWaterMark: this.highWaterMark
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  static error() {
    const response = new Response(null, { status: 0, statusText: "" });
    response[INTERNALS2].type = "error";
    return response;
  }
  static json(data = undefined, init = {}) {
    const body2 = JSON.stringify(data);
    if (body2 === undefined) {
      throw new TypeError("data is not JSON serializable");
    }
    const headers2 = new Headers(init && init.headers);
    if (!headers2.has("content-type")) {
      headers2.set("content-type", "application/json");
    }
    return new Response(body2, {
      ...init,
      headers: headers2
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
}
Object.defineProperties(Response.prototype, {
  type: { enumerable: true },
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});

// node_modules/node-fetch/src/request.js
import {format as formatUrl} from "node:url";
import {deprecate as deprecate2} from "node:util";

// node_modules/node-fetch/src/utils/get-search.js
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash.length] === "?" ? "?" : "";
};

// node_modules/node-fetch/src/utils/referrer.js
import {isIP} from "node:net";
function stripURLForUseAsAReferrer(url, originOnly = false) {
  if (url == null) {
    return "no-referrer";
  }
  url = new URL(url);
  if (/^(about|blob|data):$/.test(url.protocol)) {
    return "no-referrer";
  }
  url.username = "";
  url.password = "";
  url.hash = "";
  if (originOnly) {
    url.pathname = "";
    url.search = "";
  }
  return url;
}
function validateReferrerPolicy(referrerPolicy) {
  if (!ReferrerPolicy.has(referrerPolicy)) {
    throw new TypeError(`Invalid referrerPolicy: ${referrerPolicy}`);
  }
  return referrerPolicy;
}
function isOriginPotentiallyTrustworthy(url) {
  if (/^(http|ws)s:$/.test(url.protocol)) {
    return true;
  }
  const hostIp = url.host.replace(/(^\[)|(]$)/g, "");
  const hostIPVersion = isIP(hostIp);
  if (hostIPVersion === 4 && /^127\./.test(hostIp)) {
    return true;
  }
  if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) {
    return true;
  }
  if (url.host === "localhost" || url.host.endsWith(".localhost")) {
    return false;
  }
  if (url.protocol === "file:") {
    return true;
  }
  return false;
}
function isUrlPotentiallyTrustworthy(url) {
  if (/^about:(blank|srcdoc)$/.test(url)) {
    return true;
  }
  if (url.protocol === "data:") {
    return true;
  }
  if (/^(blob|filesystem):$/.test(url.protocol)) {
    return true;
  }
  return isOriginPotentiallyTrustworthy(url);
}
function determineRequestsReferrer(request, { referrerURLCallback, referrerOriginCallback } = {}) {
  if (request.referrer === "no-referrer" || request.referrerPolicy === "") {
    return null;
  }
  const policy = request.referrerPolicy;
  if (request.referrer === "about:client") {
    return "no-referrer";
  }
  const referrerSource = request.referrer;
  let referrerURL = stripURLForUseAsAReferrer(referrerSource);
  let referrerOrigin = stripURLForUseAsAReferrer(referrerSource, true);
  if (referrerURL.toString().length > 4096) {
    referrerURL = referrerOrigin;
  }
  if (referrerURLCallback) {
    referrerURL = referrerURLCallback(referrerURL);
  }
  if (referrerOriginCallback) {
    referrerOrigin = referrerOriginCallback(referrerOrigin);
  }
  const currentURL = new URL(request.url);
  switch (policy) {
    case "no-referrer":
      return "no-referrer";
    case "origin":
      return referrerOrigin;
    case "unsafe-url":
      return referrerURL;
    case "strict-origin":
      if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
        return "no-referrer";
      }
      return referrerOrigin.toString();
    case "strict-origin-when-cross-origin":
      if (referrerURL.origin === currentURL.origin) {
        return referrerURL;
      }
      if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
        return "no-referrer";
      }
      return referrerOrigin;
    case "same-origin":
      if (referrerURL.origin === currentURL.origin) {
        return referrerURL;
      }
      return "no-referrer";
    case "origin-when-cross-origin":
      if (referrerURL.origin === currentURL.origin) {
        return referrerURL;
      }
      return referrerOrigin;
    case "no-referrer-when-downgrade":
      if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
        return "no-referrer";
      }
      return referrerURL;
    default:
      throw new TypeError(`Invalid referrerPolicy: ${policy}`);
  }
}
function parseReferrerPolicyFromHeader(headers2) {
  const policyTokens = (headers2.get("referrer-policy") || "").split(/[,\s]+/);
  let policy = "";
  for (const token of policyTokens) {
    if (token && ReferrerPolicy.has(token)) {
      policy = token;
    }
  }
  return policy;
}
var ReferrerPolicy = new Set([
  "",
  "no-referrer",
  "no-referrer-when-downgrade",
  "same-origin",
  "origin",
  "strict-origin",
  "origin-when-cross-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url"
]);
var DEFAULT_REFERRER_POLICY = "strict-origin-when-cross-origin";

// node_modules/node-fetch/src/request.js
var INTERNALS3 = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS3] === "object";
};
var doBadDataWarn = deprecate2(() => {
}, ".data is not a valid RequestInit property, use .body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (request)");

class Request extends Body {
  constructor(input, init = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    if (parsedURL.username !== "" || parsedURL.password !== "") {
      throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
    }
    let method = init.method || input.method || "GET";
    if (/^(delete|get|head|options|post|put)$/i.test(method)) {
      method = method.toUpperCase();
    }
    if (!isRequest(init) && "data" in init) {
      doBadDataWarn();
    }
    if ((init.body != null || isRequest(input) && input.body !== null) && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init.body ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init.size || input.size || 0
    });
    const headers3 = new Headers(init.headers || input.headers || {});
    if (inputBody !== null && !headers3.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers3.set("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init) {
      signal = init.signal;
    }
    if (signal != null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
    }
    let referrer2 = init.referrer == null ? input.referrer : init.referrer;
    if (referrer2 === "") {
      referrer2 = "no-referrer";
    } else if (referrer2) {
      const parsedReferrer = new URL(referrer2);
      referrer2 = /^about:(\/\/)?client$/.test(parsedReferrer) ? "client" : parsedReferrer;
    } else {
      referrer2 = undefined;
    }
    this[INTERNALS3] = {
      method,
      redirect: init.redirect || input.redirect || "follow",
      headers: headers3,
      parsedURL,
      signal,
      referrer: referrer2
    };
    this.follow = init.follow === undefined ? input.follow === undefined ? 20 : input.follow : init.follow;
    this.compress = init.compress === undefined ? input.compress === undefined ? true : input.compress : init.compress;
    this.counter = init.counter || input.counter || 0;
    this.agent = init.agent || input.agent;
    this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
    this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || "";
  }
  get method() {
    return this[INTERNALS3].method;
  }
  get url() {
    return formatUrl(this[INTERNALS3].parsedURL);
  }
  get headers() {
    return this[INTERNALS3].headers;
  }
  get redirect() {
    return this[INTERNALS3].redirect;
  }
  get signal() {
    return this[INTERNALS3].signal;
  }
  get referrer() {
    if (this[INTERNALS3].referrer === "no-referrer") {
      return "";
    }
    if (this[INTERNALS3].referrer === "client") {
      return "about:client";
    }
    if (this[INTERNALS3].referrer) {
      return this[INTERNALS3].referrer.toString();
    }
    return;
  }
  get referrerPolicy() {
    return this[INTERNALS3].referrerPolicy;
  }
  set referrerPolicy(referrerPolicy) {
    this[INTERNALS3].referrerPolicy = validateReferrerPolicy(referrerPolicy);
  }
  clone() {
    return new Request(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
}
Object.defineProperties(Request.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true },
  referrer: { enumerable: true },
  referrerPolicy: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS3];
  const headers3 = new Headers(request[INTERNALS3].headers);
  if (!headers3.has("Accept")) {
    headers3.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers3.set("Content-Length", contentLengthValue);
  }
  if (request.referrerPolicy === "") {
    request.referrerPolicy = DEFAULT_REFERRER_POLICY;
  }
  if (request.referrer && request.referrer !== "no-referrer") {
    request[INTERNALS3].referrer = determineRequestsReferrer(request);
  } else {
    request[INTERNALS3].referrer = "no-referrer";
  }
  if (request[INTERNALS3].referrer instanceof URL) {
    headers3.set("Referer", request.referrer);
  }
  if (!headers3.has("User-Agent")) {
    headers3.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers3.has("Accept-Encoding")) {
    headers3.set("Accept-Encoding", "gzip, deflate, br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  const search = getSearch(parsedURL);
  const options = {
    path: parsedURL.pathname + search,
    method: request.method,
    headers: headers3[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return {
    parsedURL,
    options
  };
};

// node_modules/node-fetch/src/errors/abort-error.js
class AbortError extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
}

// node_modules/node-fetch/src/index.js
init_esm_min();
init_from();
var fixResponseChunkedTransferBadEnding = function(request2, errorCallback) {
  const LAST_CHUNK = Buffer3.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request2.on("response", (response2) => {
    const { headers: headers4 } = response2;
    isChunkedTransfer = headers4["transfer-encoding"] === "chunked" && !headers4["content-length"];
  });
  request2.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error = new Error("Premature close");
        error.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error);
      }
    };
    const onData = (buf) => {
      properLastChunkReceived = Buffer3.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer3.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer3.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    };
    socket.prependListener("close", onSocketClose);
    socket.on("data", onData);
    request2.on("close", () => {
      socket.removeListener("close", onSocketClose);
      socket.removeListener("data", onData);
    });
  });
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch(url, options_) {
  return new Promise((resolve, reject) => {
    const request2 = new Request(url, options_);
    const { parsedURL, options } = getNodeRequestOptions(request2);
    if (!supportedSchemas.has(parsedURL.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (parsedURL.protocol === "data:") {
      const data = dist_default(request2.url);
      const response3 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve(response3);
      return;
    }
    const send = (parsedURL.protocol === "https:" ? https : http2).request;
    const { signal } = request2;
    let response2 = null;
    const abort = () => {
      const error = new AbortError("The operation was aborted.");
      reject(error);
      if (request2.body && request2.body instanceof Stream2.Readable) {
        request2.body.destroy(error);
      }
      if (!response2 || !response2.body) {
        return;
      }
      response2.body.emit("error", error);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(parsedURL.toString(), options);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error) => {
      reject(new FetchError(`request to ${request2.url} failed, reason: ${error.message}`, "system", error));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error) => {
      if (response2 && response2.body) {
        response2.body.destroy(error);
      }
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response2 && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error = new Error("Premature close");
            error.code = "ERR_STREAM_PREMATURE_CLOSE";
            response2.body.emit("error", error);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers4 = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers4.get("Location");
        let locationURL = null;
        try {
          locationURL = location === null ? null : new URL(location, request2.url);
        } catch {
          if (request2.redirect !== "manual") {
            reject(new FetchError(`uri requested responds with an invalid redirect URL: ${location}`, "invalid-redirect"));
            finalize();
            return;
          }
        }
        switch (request2.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request2.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request2.counter >= request2.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request2.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request2.headers),
              follow: request2.follow,
              counter: request2.counter + 1,
              agent: request2.agent,
              compress: request2.compress,
              method: request2.method,
              body: clone(request2),
              signal: request2.signal,
              size: request2.size,
              referrer: request2.referrer,
              referrerPolicy: request2.referrerPolicy
            };
            if (!isDomainOrSubdomain(request2.url, locationURL) || !isSameProtocol(request2.url, locationURL)) {
              for (const name of ["authorization", "www-authenticate", "cookie", "cookie2"]) {
                requestOptions.headers.delete(name);
              }
            }
            if (response_.statusCode !== 303 && request2.body && options_.body instanceof Stream2.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request2.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = undefined;
              requestOptions.headers.delete("content-length");
            }
            const responseReferrerPolicy = parseReferrerPolicyFromHeader(headers4);
            if (responseReferrerPolicy) {
              requestOptions.referrerPolicy = responseReferrerPolicy;
            }
            resolve(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request2.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body4 = pump(response_, new PassThrough2, (error) => {
        if (error) {
          reject(error);
        }
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request2.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers: headers4,
        size: request2.size,
        counter: request2.counter,
        highWaterMark: request2.highWaterMark
      };
      const codings = headers4.get("Content-Encoding");
      if (!request2.compress || request2.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response2 = new Response(body4, responseOptions);
        resolve(response2);
        return;
      }
      const zlibOptions = {
        flush: zlib.Z_SYNC_FLUSH,
        finishFlush: zlib.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body4 = pump(body4, zlib.createGunzip(zlibOptions), (error) => {
          if (error) {
            reject(error);
          }
        });
        response2 = new Response(body4, responseOptions);
        resolve(response2);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = pump(response_, new PassThrough2, (error) => {
          if (error) {
            reject(error);
          }
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body4 = pump(body4, zlib.createInflate(), (error) => {
              if (error) {
                reject(error);
              }
            });
          } else {
            body4 = pump(body4, zlib.createInflateRaw(), (error) => {
              if (error) {
                reject(error);
              }
            });
          }
          response2 = new Response(body4, responseOptions);
          resolve(response2);
        });
        raw.once("end", () => {
          if (!response2) {
            response2 = new Response(body4, responseOptions);
            resolve(response2);
          }
        });
        return;
      }
      if (codings === "br") {
        body4 = pump(body4, zlib.createBrotliDecompress(), (error) => {
          if (error) {
            reject(error);
          }
        });
        response2 = new Response(body4, responseOptions);
        resolve(response2);
        return;
      }
      response2 = new Response(body4, responseOptions);
      resolve(response2);
    });
    writeToStream(request_, request2).catch(reject);
  });
}

// lib/request.ts
async function request2(path, queries = {}, options = {}, retry_count = 0) {
  if (!api_url) {
    throw new Error("GPACT_API_URL is not set");
  }
  const signal = new import_abort_controller.AbortController;
  const timeout = setTimeout(() => signal.abort(), 5000);
  const url = new URL(path, api_url);
  for (const [key, value] of Object.entries(queries)) {
    url.searchParams.append(key, value.toString());
  }
  let res;
  try {
    res = await fetch(url.toString(), {
      ...options,
      signal: signal.signal,
      ..."bun" in process.versions ? { headers: { ...options.headers, "Accept-Encoding": "gzip" } } : {}
    });
  } catch (e2) {
    clearTimeout(timeout);
    if (e2 instanceof Error && e2.name === "AbortError") {
      if (retry_count < 3) {
        return request2(path, queries, options, retry_count + 1);
      }
    }
    throw e2;
  }
  clearTimeout(timeout);
  return res;
}
async function json(path, queries = {}, options = {}) {
  const res = await request2(path, queries, options);
  return res.json();
}
var api_url = process.env.GPACT_API_URL;

// lib/resources.ts
var create_resource = function(type, encode) {
  return {
    type,
    encode
  };
};
var resources = {
  artifacts: create_resource("artifacts", true),
  boss: create_resource("boss/weekly-boss", true),
  characters: create_resource("characters", true),
  foods: create_resource("consumables/food", false),
  potions: create_resource("consumables/potions", false),
  domains: create_resource("domains", true),
  elements: create_resource("elements", true),
  enemies: create_resource("enemies", true),
  boss_materials: create_resource("materials/boss-material", false),
  character_ascension: create_resource("materials/character-ascension", false),
  character_experience: create_resource("materials/character-experience", false),
  common_ascension: create_resource("materials/common-ascension", false),
  cooking_ingredients: create_resource("materials/cooking-ingredients", false),
  local_specialties: create_resource("materials/local-specialties", false),
  talent_book: create_resource("materials/talent-book", false),
  talent_boss: create_resource("materials/talent-boss", false),
  weapon_ascension: create_resource("materials/weapon-ascension", false),
  weapon_experience: create_resource("materials/weapon-experience", false),
  nations: create_resource("nations", true),
  weapons: create_resource("weapons", true)
};

// lib/index.ts
async function resolve_entity(type, id) {
  const entity = await json(join(type, id));
  return {
    id,
    ...entity
  };
}
var resolve_entities = function(type) {
  return async (ids) => Promise.all(ids.map((id) => resolve_entity(type, id)));
};
var create_endpoint = function(resource_type) {
  const { type: _type, encode } = resources[resource_type];
  const type = encode ? encodeURIComponent(_type) : _type;
  const methods = {
    get all() {
      if (!encode)
        return json(type);
      return json(type).then(resolve_entities(type));
    },
    get: async (id) => {
      if (!encode) {
        const all = await methods.all;
        const find = all[id];
        if (!find) {
          throw new Error(`Could not find ${id} in ${type}`);
        }
        return find;
      }
      return resolve_entity(type, id);
    },
    images: async (id) => {
      const ids = await json(join(type, id, "list"));
      return ids.map((i2) => new URL(join(type, id, i2), api_url).toString());
    }
  };
  return methods;
};
var artifacts = create_endpoint("artifacts");
var boss = create_endpoint("boss");
var characters = create_endpoint("characters");
var foods = create_endpoint("foods");
var potions = create_endpoint("potions");
var domains = create_endpoint("domains");
var elements = create_endpoint("elements");
var enemies = create_endpoint("enemies");
var boss_materials = create_endpoint("boss_materials");
var character_ascension = create_endpoint("character_ascension");
var character_experience = create_endpoint("character_experience");
var common_ascension = create_endpoint("common_ascension");
var cooking_ingredients = create_endpoint("cooking_ingredients");
var local_specialties = create_endpoint("local_specialties");
var talent_book = create_endpoint("talent_book");
var talent_boss = create_endpoint("talent_boss");
var weapon_ascension = create_endpoint("weapon_ascension");
var weapon_experience = create_endpoint("weapon_experience");
var nations = create_endpoint("nations");
var weapons = create_endpoint("weapons");
export {
  weapons,
  weapon_experience,
  weapon_ascension,
  talent_boss,
  talent_book,
  potions,
  nations,
  local_specialties,
  foods,
  enemies,
  elements,
  domains,
  cooking_ingredients,
  common_ascension,
  characters,
  character_experience,
  character_ascension,
  boss_materials,
  boss,
  artifacts
};
