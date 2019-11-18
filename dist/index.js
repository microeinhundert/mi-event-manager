"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _debounce = require("debounce");

var _delegatedEvents = require("delegated-events");

var _lightEventBus = require("light-event-bus");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EventHandler = function () {
  _createClass(EventHandler, [{
    key: "logActionToConsole",
    value: function logActionToConsole(listener, elementOrSelector, detach, delegate) {
      if (!listener) return;
      var $unixTimestamp = new Date().getTime();

      if (elementOrSelector) {
        var $elementIdentifier = typeof elementOrSelector === 'string' ? elementOrSelector : elementOrSelector.className || elementOrSelector.nodeName || _typeof(elementOrSelector);
        console.log("%c[".concat($unixTimestamp, "] ").concat(detach ? 'Removed' : 'Added').concat(delegate ? ' delegated' : '', " listener \"").concat(listener, "\" ").concat(detach ? 'from' : 'to', " \"").concat($elementIdentifier, "\"."), "color: ".concat(detach ? 'red' : 'green'));
      } else {
        console.log("%c[".concat($unixTimestamp, "] Subscribed to \"").concat(listener, "\" on the global event bus."), 'color: blue');
      }
    }
  }, {
    key: "logExecutionToConsole",
    value: function logExecutionToConsole(eventOrListener) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!eventOrListener) return;
      var $unixTimestamp = new Date().getTime();

      if (typeof eventOrListener === 'string') {
        console.log("%c[".concat($unixTimestamp, "] Fired \"").concat(eventOrListener, "\" on the global event bus with data \"").concat(JSON.stringify(data), "\"."), 'color: purple');
      } else {
        var $elementIdentifier = eventOrListener.target.className || eventOrListener.target.nodeName || _typeof(eventOrListener.target.element);

        console.log("%c[".concat($unixTimestamp, "] Fired \"").concat(eventOrListener.type, "\" on element \"").concat($elementIdentifier, "\"."), 'color: orange');
      }
    }
  }, {
    key: "executeListenerCallback",
    value: function executeListenerCallback(event, callback) {
      var handlerOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var paramOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (handlerOptions.preventDefault) event.preventDefault();
      if (handlerOptions.stopPropagation) event.stopPropagation();

      if (handlerOptions.debounce) {
        var $debounceOptions = _objectSpread({
          wait: 1000,
          immediate: false
        }, handlerOptions.debounce);

        (0, _debounce.debounce)(callback(event), $debounceOptions.wait, $debounceOptions.immediate);
      } else {
        callback(event);
      }

      if (handlerOptions.debug || paramOptions.debug || this.options.debug) this.logExecutionToConsole(event);
    }
  }, {
    key: "executeBusCallback",
    value: function executeBusCallback(listener, data, callback) {
      var handlerOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var paramOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      if (handlerOptions.debounce) {
        var $debounceOptions = _objectSpread({
          wait: 1000,
          immediate: false
        }, handlerOptions.debounce);

        (0, _debounce.debounce)(callback(data), $debounceOptions.wait, $debounceOptions.immediate);
      } else {
        callback(data);
      }

      if (handlerOptions.debug || paramOptions.debug || this.options.debug) this.logExecutionToConsole(listener, data);
    }
  }, {
    key: "listen",
    value: function listen(elementOrSelector, listener, callback) {
      var _this = this;

      var handlerOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var paramOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      if (handlerOptions.skip) return;
      var $options = {
        capture: 'capture' in handlerOptions ? handlerOptions.capture : false,
        once: 'once' in handlerOptions ? handlerOptions.once : false,
        passive: 'passive' in handlerOptions ? handlerOptions.passive : handlerOptions.preventDefault ? false : true
      };

      if (paramOptions.detach) {
        if (paramOptions.delegate) {
          (0, _delegatedEvents.off)(listener, elementOrSelector, function (event) {
            return _this.executeListenerCallback(event, callback, handlerOptions, paramOptions);
          });
        } else {
          elementOrSelector.removeEventListener(listener, function (event) {
            return _this.executeListenerCallback(event, callback, handlerOptions, paramOptions);
          }, $options);
        }
      } else if (paramOptions.delegate) {
        (0, _delegatedEvents.on)(listener, elementOrSelector, function (event) {
          return _this.executeListenerCallback(event, callback, handlerOptions, paramOptions);
        });
      } else {
        elementOrSelector.addEventListener(listener, function (event) {
          return _this.executeListenerCallback(event, callback, handlerOptions, paramOptions);
        }, $options);
      }

      if (handlerOptions.debug || paramOptions.debug || this.options.debug) {
        this.logActionToConsole(listener, elementOrSelector, paramOptions.detach, paramOptions.delegate);
      }
    }
  }, {
    key: "subscribe",
    value: function subscribe(listener, callback) {
      var _this2 = this;

      var handlerOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var paramOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (handlerOptions.skip) return;

      _lightEventBus.EventBusSingleton.subscribe(listener, function (data) {
        return _this2.executeBusCallback(listener, data, callback, handlerOptions, paramOptions);
      });

      if (handlerOptions.debug || paramOptions.debug || this.options.debug) this.logActionToConsole(listener);
    }
  }, {
    key: "handle",
    value: function handle() {
      var _this3 = this;

      var paramOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _this$handler = this.handler,
          selector = _this$handler.selector,
          element = _this$handler.element,
          listen = _this$handler.listen,
          callback = _this$handler.callback,
          _this$handler$options = _this$handler.options,
          handlerOptions = _this$handler$options === void 0 ? {} : _this$handler$options;
      var $listeners = Array.isArray(listen) ? listen : [listen];

      if ('element' in this.handler) {
        if (this.isValidElement) {
          if (element instanceof NodeList) {
            var $elements = element;
            $elements.forEach(function (el, i) {
              $listeners.forEach(function (listener) {
                _this3.listen(el, listener, function (event) {
                  var $event = event;
                  $event.nodeListIndex = i;

                  _this3.executeListenerCallback($event, callback, handlerOptions);
                }, handlerOptions, paramOptions);
              });
            });
          } else {
            $listeners.forEach(function (listener) {
              _this3.listen(element, listener, function (event) {
                return _this3.executeListenerCallback(event, callback, handlerOptions);
              }, handlerOptions, paramOptions);
            });
          }
        } else if (this.options.strictChecking) {
          throw new Error("\"".concat(element, "\" is not a valid element."));
        }
      } else if ('selector' in this.handler) {
        if (this.isValidSelector) {
          var $paramOptions = _objectSpread({
            delegate: 'delegate' in handlerOptions ? handlerOptions.delegate : true
          }, paramOptions);

          if ($paramOptions.delegate) {
            $listeners.forEach(function (listener) {
              _this3.listen(selector, listener, function (event) {
                return _this3.executeListenerCallback(event, callback, handlerOptions);
              }, handlerOptions, $paramOptions);
            });
          } else {
            var _$elements = document.querySelectorAll(selector);

            _$elements.forEach(function (el) {
              $listeners.forEach(function (listener) {
                _this3.listen(el, listener, function (event) {
                  return _this3.executeListenerCallback(event, callback, handlerOptions);
                }, handlerOptions, $paramOptions);
              });
            });
          }
        } else if (this.options.strictChecking) {
          throw new Error("\"".concat(selector, "\" is not a valid selector."));
        }
      } else {
        $listeners.forEach(function (listener) {
          _this3.subscribe(listener, callback, handlerOptions, paramOptions);
        });
      }
    }
  }, {
    key: "handler",
    get: function get() {
      return this._handler;
    },
    set: function set(handler) {
      this._handler = handler;
    }
  }, {
    key: "options",
    get: function get() {
      return this._options;
    },
    set: function set(options) {
      this._options = options;
    }
  }, {
    key: "isValidSelector",
    get: function get() {
      var $selector = this.handler.selector || '';

      try {
        document.querySelector($selector);
        return true;
      } catch (_unused) {
        return false;
      }
    }
  }, {
    key: "isValidElement",
    get: function get() {
      var $element = this.handler.element || {};
      var $isObject = _typeof($element) === 'object';
      var $hasAddMethod = $element.addEventListener;
      var $isNodeList = $element instanceof NodeList;
      return $isObject && ($hasAddMethod || $isNodeList);
    }
  }]);

  function EventHandler() {
    var handler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EventHandler);

    _defineProperty(this, "_handler", {});

    _defineProperty(this, "_options", {
      strictChecking: false,
      debug: false
    });

    this.handler = handler;
    if ('debug' in options) this.options.debug = !!options.debug;
    if ('strictChecking' in options) this.options.strictChecking = !!options.strictChecking;
  }

  return EventHandler;
}();

var _default = EventHandler;
exports["default"] = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "EventBus", {
  enumerable: true,
  get: function get() {
    return _lightEventBus.EventBusSingleton;
  }
});
exports.EventManager = void 0;

var _lightEventBus = require("light-event-bus");

var _EventHandler = _interopRequireDefault(require("./EventHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EventManager = function () {
  _createClass(EventManager, [{
    key: "handleAll",
    value: function handleAll() {
      var paramOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.handlers.forEach(function (handlerInstance) {
        return handlerInstance.handle(paramOptions);
      });
    }
  }, {
    key: "handleSingle",
    value: function handleSingle(elementOrSelector) {
      var paramOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.handlers.filter(function (_ref) {
        var handler = _ref.handler;
        return handler.element === elementOrSelector || handler.selector === elementOrSelector;
      }).forEach(function (handlerInstance) {
        return handlerInstance.handle(paramOptions);
      });
    }
  }, {
    key: "attachAll",
    value: function attachAll() {
      var paramOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.handleAll(paramOptions);
    }
  }, {
    key: "detachAll",
    value: function detachAll() {
      var paramOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var $paramOptions = _objectSpread({}, paramOptions, {
        detach: true
      });

      this.handleAll($paramOptions);
    }
  }, {
    key: "attach",
    value: function attach(elementOrSelector) {
      var paramOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (elementOrSelector) {
        this.handleSingle(elementOrSelector, paramOptions);
      } else {
        this.handleAll(paramOptions);
      }
    }
  }, {
    key: "detach",
    value: function detach(elementOrSelector) {
      var paramOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var $paramOptions = _objectSpread({}, paramOptions, {
        detach: true
      });

      if (elementOrSelector) {
        this.handleSingle(elementOrSelector, $paramOptions);
      } else {
        this.handleAll($paramOptions);
      }
    }
  }, {
    key: "handlers",
    get: function get() {
      return this._handlers;
    },
    set: function set(handlers) {
      this._handlers = handlers;
    }
  }], [{
    key: "publish",
    value: function publish(event) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _lightEventBus.EventBusSingleton.publish(event, data);
    }
  }]);

  function EventManager() {
    var handlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EventManager);

    _defineProperty(this, "handlers", {});

    this.handlers = handlers.map(function (handler) {
      return new _EventHandler["default"](handler, options);
    });
  }

  return EventManager;
}();

exports.EventManager = EventManager;
