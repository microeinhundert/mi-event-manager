import { EventBusSingleton as EventBus } from 'light-event-bus';

import EventHandler from './EventHandler';

class EventManager {
  /**
   * Handlers
   */
  handlers = {};

  /**
   * Getter to get the handlers.
   * @returns {Object}
   */
  get handlers() {
    return this._handlers;
  }

  /**
   * Setter to set the handlers.
   * @param {Object} handlers The handlers.
   * @returns {void}
   */
  set handlers(handlers) {
    this._handlers = handlers;
  }

  /**
   * Publish an event on the global event bus.
   * @param {string} event The event to publish.
   * @param {Object} data The data to pass with the event.
   * @returns {void}
   */
  static publish(event, data = {}) {
    EventBus.publish(event, data);
  }

  /**
   * Handle all event listeners.
   * @param {Object} paramOptions Options passed as function parameter.
   * @returns {void}
   */
  handleAll(paramOptions = {}) {
    this.handlers.forEach(handlerInstance => handlerInstance.handle(paramOptions));
  }

  /**
   * Handle a single event listener.
   * @param {HTMLElement|string} elementOrSelector The HTMLElement or CSS selector.
   * @param {Object} paramOptions Options passed as function parameter.
   * @returns {void}
   */
  handleSingle(elementOrSelector, paramOptions = {}) {
    this.handlers
      .filter(({ handler }) => (handler.element === elementOrSelector) || (handler.selector === elementOrSelector))
      .forEach(handlerInstance => handlerInstance.handle(paramOptions));
  }

  /**
   * Attach all event listeners.
   * @param {Object} paramOptions Options passed as function parameter.
   * @returns {void}
   */
  attachAll(paramOptions = {}) {
    this.handleAll(paramOptions);
  }

  /**
   * Detach all event listeners.
   * @param {Object} paramOptions Options passed as function parameter.
   * @returns {void}
   */
  detachAll(paramOptions = {}) {
    const $paramOptions = {
      ...paramOptions,
      detach: true
    };

    this.handleAll($paramOptions);
  }

  /**
   * Attach a single event listener.
   * @param {HTMLElement|string} elementOrSelector The HTMLElement or CSS selector.
   * @param {Object} paramOptions Options passed as function parameter.
   * @returns {void}
   */
  attach(elementOrSelector, paramOptions = {}) {
    if (elementOrSelector) {
      this.handleSingle(elementOrSelector, paramOptions);
    } else {
      this.handleAll(paramOptions);
    }
  }

  /**
   * Detach a single event listener.
   * @param {HTMLElement|string} elementOrSelector The HTMLElement or CSS selector.
   * @param {Object} paramOptions Options passed as function parameter.
   * @returns {void}
   */
  detach(elementOrSelector, paramOptions = {}) {
    const $paramOptions = {
      ...paramOptions,
      detach: true
    };

    if (elementOrSelector) {
      this.handleSingle(elementOrSelector, $paramOptions);
    } else {
      this.handleAll($paramOptions);
    }
  }

  /**
   * Invoked when a class instance is created.
   * @param {array} handlers The handlers.
   * @param {Object} options Options for this event manager instance.
   * @returns {void}
   */
  constructor(handlers = [], options = {}) {
    this.handlers = handlers.map(handler => new EventHandler(handler, options));
  }
}

export default EventManager;
export { EventManager, EventBus };
