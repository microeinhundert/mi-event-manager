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
exports.EventManager = exports.default = void 0;

var _lightEventBus = require("light-event-bus");

var _EventHandler = _interopRequireDefault(require("./EventHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    value: function handleSingle(nodeOrSelector) {
      var paramOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.handlers.filter(function (_ref) {
        var handler = _ref.handler;
        return handler.node === nodeOrSelector || handler.selector === nodeOrSelector;
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
    value: function attach(nodeOrSelector) {
      var paramOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (nodeOrSelector) {
        this.handleSingle(nodeOrSelector, paramOptions);
      } else {
        this.handleAll(paramOptions);
      }
    }
  }, {
    key: "detach",
    value: function detach(nodeOrSelector) {
      var paramOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var $paramOptions = _objectSpread({}, paramOptions, {
        detach: true
      });

      if (nodeOrSelector) {
        this.handleSingle(nodeOrSelector, $paramOptions);
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

    _defineProperty(this, "_handlers", {});

    this.handlers = handlers.map(function (handler) {
      return new _EventHandler.default(handler, options);
    });
  }

  return EventManager;
}();

exports.EventManager = EventManager;
var _default = EventManager;
exports.default = _default;