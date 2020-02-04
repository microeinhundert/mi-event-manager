import { debounce } from 'debounce';
import { on, off } from 'delegated-events';
import { EventBusSingleton as EventBus } from 'light-event-bus';

class EventHandler {
  /**
   * Handler
   */
  _handler = {};

  /**
   * Options
   */
  _options = {
    strictChecking: false,
    debug: false
  };

  /**
   * Getter to get the handler.
   * @returns {Object}
   */
  get handler() {
    return this._handler;
  }

  /**
   * Setter to set the handler.
   * @param {Object} handler The handler.
   * @returns {void}
   */
  set handler(handler) {
    let $handler = handler;

    if ('node' in handler && typeof handler.node === 'object' && 'node' in handler.node) {
      $handler.node = handler.node.node;
    } else if ('nodes' in handler) {
      if (typeof handler.nodes === 'object' && 'nodes' in handler.nodes) {
        $handler.node = handler.nodes.nodes;
      } else {
        $handler.node = handler.nodes;
      }
    }
    
    if ('selector' in handler && typeof handler.selector === 'object' && 'selector' in handler.selector) {
      $handler.selector = handler.selector.selector;
    }

    this._handler = $handler;
  }

  /**
   * Getter to get the options.
   * @returns {Object}
   */
  get options() {
    return this._options;
  }

  /**
   * Setter to set the options.
   * @param {Object} options
   * @returns {void}
   */
  set options(options) {
    this._options = options;
  }

  /**
   * Getter to check if the passed selector is valid.
   * @returns {boolean}
   */
  get isValidSelector() {
    const $selector = this.handler.selector || '';

    try {
      document.querySelector($selector);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Getter to check if the passed node is valid.
   * @returns {boolean}
   */
  get isValidNode() {
    const $node = this.handler.node || {};
    const $isObject = typeof $node === 'object';
    const $hasAddMethod = $node.addEventListener;
    const $isNodeList = $node instanceof NodeList;

    return ($isObject && ($hasAddMethod || $isNodeList));
  }

  /**
   * Log an action to the console.
   * @param {string} listener Name of the listener.
   * @param {HTMLElement|string} nodeOrSelector The HTMLElement or CSS selector.
   * @param {boolean} detach Is the event listener getting detached (removed)?
   * @param {boolean} delegate Is the event listener getting added as delegated?
   * @returns {void}
   */
  logActionToConsole(listener, nodeOrSelector, detach, delegate) {
    if (!listener) return;

    const $unixTimestamp = new Date().getTime();

    if (nodeOrSelector) {
      const $nodeIdentifier = typeof nodeOrSelector === 'string' ? nodeOrSelector : (nodeOrSelector.className || nodeOrSelector.nodeName || typeof nodeOrSelector);

      console.log(
        `%c[${$unixTimestamp}] ${detach ? 'Removed' : 'Added'}${delegate ? ' delegated' : ''} listener "${listener}" ${detach ? 'from' : 'to'} "${$nodeIdentifier}".`,
        `color: ${detach ? 'red' : 'green'}`
      );
    } else {
      console.log(
        `%c[${$unixTimestamp}] Subscribed to "${listener}" on the global event bus.`,
        'color: blue'
      );
    }
  }

  /**
   * Log an execution to the console.
   * @param {Event|string} eventOrListener The event object or listener.
   * @returns {void}
   */
  logExecutionToConsole(eventOrListener, data = {}) {
    if (!eventOrListener) return;

    const $unixTimestamp = new Date().getTime();

    if (typeof eventOrListener === 'string') {
      console.log(
        `%c[${$unixTimestamp}] Fired "${eventOrListener}" on the global event bus with data "${JSON.stringify(data)}".`,
        'color: purple'
      );
    } else {
      const $nodeIdentifier = eventOrListener.target.className || eventOrListener.target.nodeName || typeof eventOrListener.target.node;

      console.log(
        `%c[${$unixTimestamp}] Fired "${eventOrListener.type}" on node "${$nodeIdentifier}".`,
        'color: orange'
      );
    }
  }

  /**
   * Execute the callback function after a listener got triggered.
   * @param {Event} event The event object.
   * @param {Function} callback The function to execute every time the listener gets triggered.
   * @param {Object} handlerOptions Options from the handler object.
   * @param {boolean} handlerOptions.debug Enable or disable the debug mode.
   * @param {boolean} handlerOptions.preventDefault Prevent the default action being executed.
   * @param {boolean} handlerOptions.stopPropagation Prevent further propagation of the current event in the capturing and bubbling phases.
   * @param {Object|boolean} handlerOptions.debounce Options for debouncing. You can also just pass 'true' to use the default options.
   * @param {number} handlerOptions.debounce.wait The wait interval time in milliseconds.
   * @param {boolean} handlerOptions.debounce.immediate Trigger the function on the leading edge instead of the trailing edge of the wait interval.
   * @param {Object} paramOptions Options passed as function parameter.
   * @param {boolean} paramOptions.debug Enable or disable the debug mode.
   * @returns {void}
   */
  executeListenerCallback(event, callback, handlerOptions = {}, paramOptions = {}) {
    if (handlerOptions.preventDefault) event.preventDefault();
    if (handlerOptions.stopPropagation) event.stopPropagation();
    if (handlerOptions.debounce) {
      const $debounceOptions = {
        wait: 1000,
        immediate: false,
        ...handlerOptions.debounce
      };

      debounce(
        callback.apply(event, [event]),
        $debounceOptions.wait,
        $debounceOptions.immediate
      );
    } else {
      callback.apply(event, [event]);
    }

    if (handlerOptions.debug || paramOptions.debug || this.options.debug) this.logExecutionToConsole(event);
  }

  /**
   * Execute the callback function after an event on the global event bus got triggered.
   * @param {string} listener The identifier of the event subscribed to.
   * @param {Object} data The event data object.
   * @param {Function} callback The function to execute every time the event on the global event bus gets triggered.
   * @param {Object} handlerOptions Options from the handler object.
   * @param {boolean} handlerOptions.debug Enable or disable the debug mode.
   * @param {Object|boolean} handlerOptions.debounce Options for debouncing. You can also just pass 'true' to use the default options.
   * @param {number} handlerOptions.debounce.wait The wait interval time in milliseconds.
   * @param {boolean} handlerOptions.debounce.immediate Trigger the function on the leading edge instead of the trailing edge of the wait interval.
   * @param {Object} paramOptions Options passed as function parameter.
   * @param {boolean} paramOptions.debug Enable or disable the debug mode.
   * @returns {void}
   */
  executeBusCallback(listener, data, callback, handlerOptions = {}, paramOptions = {}) {
    if (handlerOptions.debounce) {
      const $debounceOptions = {
        wait: 1000,
        immediate: false,
        ...handlerOptions.debounce
      };

      debounce(
        callback.apply(EventBus, [data]),
        $debounceOptions.wait,
        $debounceOptions.immediate
      );
    } else {
      callback.apply(EventBus, [data]);
    }

    if (handlerOptions.debug || paramOptions.debug || this.options.debug) this.logExecutionToConsole(listener, data);
  }

  /**
   * Listen to an event.
   * @param {HTMLElement|string} nodeOrSelector The HTMLElement or CSS selector.
   * @param {string} listener Event type to listen for.
   * @param {callback} callback The function to execute every time the listener gets triggered.
   * @param {Object} handlerOptions Options from the handler object.
   * @param {boolean} handlerOptions.debug Enable or disable the debug mode.
   * @param {boolean} handlerOptions.capture Indicates that events will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
   * @param {boolean} handlerOptions.once Indicates that the listener should be invoked at most once after being added.
   * @param {boolean} handlerOptions.passive Indicates that the listeners callback function will never call preventDefault().
   * @param {boolean} handlerOptions.skip Dont add the listeners for this handler.
   * @param {Object} paramOptions Options passed as function parameter.
   * @param {boolean} paramOptions.detach Detach (remove) the event listener.
   * @param {boolean} paramOptions.delegate Add as delegated listener to document object.
   * @param {boolean} paramOptions.debug Enable or disable the debug mode.
   * @returns {void}
   */
  listen(nodeOrSelector, listener, callback, handlerOptions = {}, paramOptions = {}) {
    if (handlerOptions.skip) return;

    const $options = {
      capture: 'capture' in handlerOptions ? handlerOptions.capture : false,
      once: 'once' in handlerOptions ? handlerOptions.once : false,
      passive: 'passive' in handlerOptions ? handlerOptions.passive : (handlerOptions.preventDefault ? false : true) // eslint-disable-line
    };

    if (paramOptions.detach) {
      if (paramOptions.delegate) {
        off(
          listener,
          nodeOrSelector,
          event => this.executeListenerCallback(event, callback, handlerOptions, paramOptions)
        );
      } else {
        nodeOrSelector.removeEventListener(
          listener,
          event => this.executeListenerCallback(event, callback, handlerOptions, paramOptions),
          $options
        );
      }
    } else if (paramOptions.delegate) {
      on(
        listener,
        nodeOrSelector,
        event => this.executeListenerCallback(event, callback, handlerOptions, paramOptions)
      );
    } else {
      nodeOrSelector.addEventListener(
        listener,
        event => this.executeListenerCallback(event, callback, handlerOptions, paramOptions),
        $options
      );
    }

    if (handlerOptions.debug || paramOptions.debug || this.options.debug) {
      this.logActionToConsole(
        listener,
        nodeOrSelector,
        paramOptions.detach,
        paramOptions.delegate
      );
    }
  }

  /**
   * Subscribe to an event on the global event bus.
   * @param {string} listener The event to subscribe to.
   * @param {Function} callback The function to call every time the event gets published somewhere.
   * @param {Object} handlerOptions Options from the handler object.
   * @param {boolean} handlerOptions.debug Enable or disable the debug mode.
   * @param {boolean} handlerOptions.skip Dont add the listeners for this handler.
   * @param {Object} paramOptions Options passed as function parameter.
   * @param {boolean} paramOptions.debug Enable or disable the debug mode.
   * @returns {void}
   */
  subscribe(listener, callback, handlerOptions = {}, paramOptions = {}) {
    if (handlerOptions.skip) return;

    EventBus.subscribe(
      listener,
      data => this.executeBusCallback(listener, data, callback, handlerOptions, paramOptions)
    );

    if (handlerOptions.debug || paramOptions.debug || this.options.debug) this.logActionToConsole(listener);
  }

  /**
   * Handle the attachment or detachment of an event listener.
   * @param {Object} paramOptions Options passed as function parameter.
   * @param {boolean} paramOptions.delegate Add as delegated listener to document object.
   * @returns {void}
   */
  handle(paramOptions = {}) {
    const {
      selector, node, listen, callback, options: handlerOptions = {}
    } = this.handler;
    const $listeners = Array.isArray(listen) ? listen : [listen];

    if ('node' in this.handler) {
      if (this.isValidNode) {
        if (node instanceof NodeList) {
          const $nodes = node;

          $nodes.forEach((el, i) => {
            $listeners.forEach((listener) => {
              this.listen(
                el,
                listener,
                (event) => {
                  const $event = event;
                  $event.nodeListIndex = i;

                  this.executeListenerCallback($event, callback, handlerOptions);
                },
                handlerOptions,
                paramOptions
              );
            });
          });
        } else {
          $listeners.forEach((listener) => {
            this.listen(
              node,
              listener,
              event => this.executeListenerCallback(event, callback, handlerOptions),
              handlerOptions,
              paramOptions
            );
          });
        }
      } else if (this.options.strictChecking) {
        throw new Error(`"${node}" is not a valid node.`);
      }
    } else if ('selector' in this.handler) {
      if (this.isValidSelector) {
        const $paramOptions = {
          delegate: 'delegate' in handlerOptions ? handlerOptions.delegate : true,
          ...paramOptions
        };

        if ($paramOptions.delegate) {
          $listeners.forEach((listener) => {
            this.listen(
              selector,
              listener,
              event => this.executeListenerCallback(event, callback, handlerOptions),
              handlerOptions,
              $paramOptions
            );
          });
        } else {
          const $nodes = document.querySelectorAll(selector);

          $nodes.forEach((el) => {
            $listeners.forEach((listener) => {
              this.listen(
                el,
                listener,
                event => this.executeListenerCallback(event, callback, handlerOptions),
                handlerOptions,
                $paramOptions
              );
            });
          });
        }
      } else if (this.options.strictChecking) {
        throw new Error(`"${selector}" is not a valid selector.`);
      }
    } else {
      $listeners.forEach((listener) => {
        this.subscribe(
          listener,
          callback,
          handlerOptions,
          paramOptions
        );
      });
    }
  }

  /**
   * Invoked when a class instance is created.
   * @param {Object} handler The handler.
   * @param {Object} options Options for this handler instance.
   * @param {boolean} options.debug Enable the debug mode for this handler instance.
   * @param {boolean} options.strictChecking Enable strict checking for this handler instance.
   * @returns {void}
   */
  constructor(handler = {}, options = {}) {
    this.handler = handler;

    if ('debug' in options) this.options.debug = !!options.debug;
    if ('strictChecking' in options) this.options.strictChecking = !!options.strictChecking;
  }
}

export default EventHandler;
