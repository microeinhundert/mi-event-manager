"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
    value: function logActionToConsole(listener, nodeOrSelector, detach, delegate) {
      if (!listener) return;
      var $unixTimestamp = new Date().getTime();

      if (nodeOrSelector) {
        var $nodeIdentifier = typeof nodeOrSelector === 'string' ? nodeOrSelector : nodeOrSelector.className || nodeOrSelector.nodeName || _typeof(nodeOrSelector);
        console.log("%c[".concat($unixTimestamp, "] ").concat(detach ? 'Removed' : 'Added').concat(delegate ? ' delegated' : '', " listener \"").concat(listener, "\" ").concat(detach ? 'from' : 'to', " \"").concat($nodeIdentifier, "\"."), "color: ".concat(detach ? 'red' : 'green'));
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
        var $nodeIdentifier = eventOrListener.target.className || eventOrListener.target.nodeName || _typeof(eventOrListener.target.node);

        console.log("%c[".concat($unixTimestamp, "] Fired \"").concat(eventOrListener.type, "\" on node \"").concat($nodeIdentifier, "\"."), 'color: orange');
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

        (0, _debounce.debounce)(callback.apply(event, [event]), $debounceOptions.wait, $debounceOptions.immediate);
      } else {
        callback.apply(event, [event]);
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
    value: function listen(nodeOrSelector, listener, callback) {
      var _this = this;

      var handlerOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var paramOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      if (handlerOptions.skip) return;
      var $options = {
        capture: 'capture' in handlerOptions ? handlerOptions.capture : false,
        once: 'once' in handlerOptions ? handlerOptions.once : false,
        passive: 'passive' in handlerOptions ? handlerOptions.passive : handlerOptions.preventDefault ? false : true
      };
      var $params = [event, callback, handlerOptions, paramOptions];

      if (paramOptions.detach) {
        if (paramOptions.delegate) {
          (0, _delegatedEvents.off)(listener, nodeOrSelector, function (event) {
            return _this.executeListenerCallback.apply(event, $params);
          });
        } else {
          nodeOrSelector.removeEventListener(listener, function (event) {
            return _this.executeListenerCallback.apply(event, $params);
          }, $options);
        }
      } else if (paramOptions.delegate) {
        (0, _delegatedEvents.on)(listener, nodeOrSelector, function (event) {
          return _this.executeListenerCallback.apply(event, $params);
        });
      } else {
        nodeOrSelector.addEventListener(listener, function (event) {
          return _this.executeListenerCallback.apply(event, $params);
        }, $options);
      }

      if (handlerOptions.debug || paramOptions.debug || this.options.debug) {
        this.logActionToConsole(listener, nodeOrSelector, paramOptions.detach, paramOptions.delegate);
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
        return _this2.executeBusCallback.apply(_lightEventBus.EventBusSingleton, [listener, data, callback, handlerOptions, paramOptions]);
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
          node = _this$handler.node,
          listen = _this$handler.listen,
          callback = _this$handler.callback,
          _this$handler$options = _this$handler.options,
          handlerOptions = _this$handler$options === void 0 ? {} : _this$handler$options;
      var $listeners = Array.isArray(listen) ? listen : [listen];

      if ('node' in this.handler) {
        if (this.isValidNode) {
          if (node instanceof NodeList) {
            var $nodes = node;
            $nodes.forEach(function (el, i) {
              $listeners.forEach(function (listener) {
                _this3.listen(el, listener, function (event) {
                  var $event = event;
                  $event.nodeListIndex = i;

                  _this3.executeListenerCallback.apply($event, [$event, callback, handlerOptions]);
                }, handlerOptions, paramOptions);
              });
            });
          } else {
            $listeners.forEach(function (listener) {
              _this3.listen(node, listener, function (event) {
                return _this3.executeListenerCallback.apply(event, [event, callback, handlerOptions]);
              }, handlerOptions, paramOptions);
            });
          }
        } else if (this.options.strictChecking) {
          throw new Error("\"".concat(node, "\" is not a valid node."));
        }
      } else if ('selector' in this.handler) {
        if (this.isValidSelector) {
          var $paramOptions = _objectSpread({
            delegate: 'delegate' in handlerOptions ? handlerOptions.delegate : true
          }, paramOptions);

          if ($paramOptions.delegate) {
            $listeners.forEach(function (listener) {
              _this3.listen(selector, listener, function (event) {
                return _this3.executeListenerCallback.apply(event, [event, callback, handlerOptions]);
              }, handlerOptions, $paramOptions);
            });
          } else {
            var _$nodes = document.querySelectorAll(selector);

            _$nodes.forEach(function (el) {
              $listeners.forEach(function (listener) {
                _this3.listen(el, listener, function (event) {
                  return _this3.executeListenerCallback.apply(event, [event, callback, handlerOptions]);
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
      var $handler = handler;

      if ('node' in handler && _typeof(handler.node) === 'object' && 'node' in handler.node) {
        $handler.node = handler.node.node;
      } else if ('nodes' in handler) {
        if (_typeof(handler.nodes) === 'object' && 'nodes' in handler.nodes) {
          $handler.node = handler.nodes.nodes;
        } else {
          $handler.node = handler.nodes;
        }
      }

      if ('selector' in handler && _typeof(handler.selector) === 'object' && 'selector' in handler.selector) {
        $handler.selector = handler.selector.selector;
      }

      this._handler = $handler;
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
    key: "isValidNode",
    get: function get() {
      var $node = this.handler.node || {};
      var $isObject = _typeof($node) === 'object';
      var $hasAddMethod = $node.addEventListener;
      var $isNodeList = $node instanceof NodeList;
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
exports.default = _default;