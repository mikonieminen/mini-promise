/**
 * @author Miko Nieminen <miko.nieminen@iki.fi>
 * @license {@link http://opensource.org/licenses/MIT|MIT}
 *
 * @name mini-promise
 * @module
 *
 * @example <caption>Using mini-promise.</caption>
 * var Promise = require('mini-promise').Promise;
 * var p = new Promise(function(ready, error, abort) {
 *     // Do what needs to be done.
 *     // Report ready with arguments
 *     ready(thing1, thing2);
 *     // or report error
 *     error(new Error("Something went wrong.");
 *     // or report that operation was aborted
 *     abort("User cancelled the operation.");
 * });
 *
 * p.ready(function(thing1, thing2) {
 *     // What to do when ready and got data.
 * }).error(function(err) {
 *     // What to do in case of error.
 * }).abort(function(reason) {
 *     // What to do when aborted.
 * });
 *
 * // You can also use generic {@link module:mini-module.Promise#on|Promise.on}
 * p.on("ready", function(thing1, thing2) {
 *     // What to do when ready and got data.
 * }).on("error", function(err) {
 *     // What to do in case of error.
 * }).on("abort", function(reason) {
 *     // What to do when aborted.
 * });
 */
(function(module) {
    "use strict"

    /**
     * Callback to notify that Promise succeed.
     *
     * @public
     *
     * @callback module:mini-promise.Promise~payloadReady
     *
     * @param {...Object} arguments Data to pass forward after Promise results with success.
     */

    /**
     * Callback to notify that Promise resulted with Error.
     *
     * @public
     *
     * @callback module:mini-promise.Promise~payloadError
     *
     * @param {Error} error Error object explaining error while trying to fulfill the Promise.
     */

    /**
     * Callback to notify that Promise was aborted.
     *
     * @public
     *
     * @callback module:mini-promise.Promise~payloadAbort
     *
     * @param {String} reason Reason for abortion.
     */

    /**
     * Function to execute as a payload of the promise.
     *
     * @public
     *
     * @name module:mini-promise.Promise~payloadFunction
     *
     * @callback module:mini-promise.Promise~payloadFunction
     *
     * @param {module:mini-promise.Promise~payloadReady} ready Function to call when exucution succeed.
     * @param {module:mini-promise.Promise~payloadError} error Function to call when exucution failed.
     * @param {module:mini-promise.Promise~payloadAbort} abort Function to call when execution was aborted.
     */

    /**
     * @typedef PromiseProperties
     * @type {object}
     * @param {boolean} [async=false] Force payload execution happen asynchronously, by default not.
     */

    /**
     * Simple promise/future implementation.
     *
     * @name module:mini-promise.Promise
     *
     * @constructor
     *
     * @param {PromiseProperties} [properties] Properties object that can configure behaviour of
     * the Promise.
     * @param {module:mini-promise.Promise~payloadFunction} payload Function to execute.
     */
    function Promise(properties, payload) {
        var self = this;

        this.payload = null;
        this.completed = false;

        this.properties =  {
            async: false,
            run: true
        };

        this.listeners = {
            ready: [],
            error: [],
            abort: []
        };

        this.result = {
            event: null,
            data: null
        };

        if (typeof properties === "function" && payload === undefined) {
            this.payload = properties;
        } else if (typeof properties === "object" && typeof payload === "function") {
            this.payload = payload;
            for (var prop in properties) {
                this.properties[prop] = properties[prop];
            }
        } else {
            throw new Error("Incorrect parameters for creating promise");
        }

        if (this.properties.run) {
            if (this.properties.async) {
                setTimeout(function() {
                    self.run();
                }, 0);
            } else {
                this.run();
            }
        }
    }

    /**
     * Promise payload ready handler.
     *
     * @private
     * @method
     *
     * @name module:mini-module.Promise#onReady
     *
     * @param {...Object} arguments List of arguments payload passes when succeed.
     */
    Promise.prototype.onReady = function() {
        var i = 0;
        var length = this.listeners.ready.length;
        var func;

        if (!this.completed) {
            this.completed = true;
            this.result.event = "ready";
            this.result.data = [];
            for(i = 0; i < arguments.length; ++i) {
                this.result.data.push(arguments[i]);
            }
            for (i = 0; i < length; ++i) {
                func = this.listeners.ready.shift();
                func.apply(undefined, this.result.data);
            }
        }
    };

    /**
     * Promise payload error handler.
     *
     * @private
     * @method
     *
     * @name module:mini-module.Promise#onError
     *
     * @param {Error} err Error descibing error situation.
     */
    Promise.prototype.onError = function(err) {
        var i = 0;
        var length = this.listeners.error.length;
        var func;

        if (!this.completed) {
            this.completed = true;
            this.result.event = "error";
            this.result.data = err;
            for (i = 0; i < length; ++i) {
                func = this.listeners.error.shift();
                func.call(undefined, this.result.data);
            }
        }
    };

    /**
     * Promise payload abort handler.
     *
     * @private
     * @method
     *
     * @name module:mini-module.Promise#onAbort
     *
     * @param {string} reason Reason why promise was aborted.
     */
    Promise.prototype.onAbort = function(reason) {
        var i = 0;
        var length = this.listeners.abort.length;
        var func;

        if (!this.completed) {
            this.completed = true;
            this.result.event = "abort";
            this.result.data = reason;
            for (i = 0; i < length; ++i) {
                func = this.listeners.abort.shift();
                func.call(undefined, this.result.data);
            }
        }
    };

    /**
     * Payload runner.
     *
     * @private
     * @method
     *
     */
    Promise.prototype.run = function() {
        this.payload(this.onReady.bind(this), this.onError.bind(this), this.onAbort.bind(this));
    };

    /**
     * Generic method for registering callback for a event type in the Promise.
     *
     * @public
     * @method
     *
     * @name module:mini-promise.Promise#on
     * @see {@link module:mini-promise.Promise#error}
     * @see {@link module:mini-promise.Promise#abort}
     * @see {@link module:mini-promise.Promise#ready}
     *
     * @param {string} event Event name, value should be "ready", "error" or "abort".
     * @param {module:mini-promise.Promise#ready~readyCb|module:mini-promise.Promise#error~errorCb|module:mini-promise.Promise#abort~abortCb} callback The callback function.
     * @returns module:mini-promise.Promise Returns promise it self so that on, ready, error and abort can be chained;
     */
    Promise.prototype.on = function(event, callback) {
        if (!this.completed) {
            if (this.listeners[event] === undefined) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        } else if (this.result.event === event) {
            callback.apply(undefined, this.result.data);
        }
        return this;
    };

    /**
     * Callback for receiving notification when Promise succeed.
     *
     * @public
     *
     * @name module:mini-promise.Promise#ready~readyCb
     *
     * @callback module:mini-promise.Promise#ready~readyCb
     * @param {...Object} args Arguments having data from the Promise.
     */

    /**
     * Register callback for receiving notification when Promise succeeds.
     *
     * @public
     * @method
     *
     * @name module:mini-promise.Promise#ready
     *
     * @param {module:mini-promise.Promise#ready~readyCb} callback The callback function.
     * @returns {module:mini-promise.Promise} Returns promise it self so that on, ready, error and abort can be chained;
     */
    Promise.prototype.ready = function(callback) {
        return this.on("ready", callback);
    };

    /**
     * Callback for receiving notification when Promise ends with an Error.
     *
     * @public
     *
     * @name module:mini-promise.Promise#error~errorCb
     *
     * @callback module:mini-promise.Promise#error~errorCb
     * @param {Error} error Error object explaining the error.
     */

    /**
     * Register callback for receiving notification when Promise ends with an Error.
     *
     * @public
     * @method
     *
     * @name module:mini-promise.Promise#error
     *
     * @param {module:mini-promise.Promise#error~errorCb} callback The callback function.
     * @returns {module:mini-promise.Promise} Returns promise it self so that on, ready, error and abort can be chained;
     */
    Promise.prototype.error = function(callback) {
        return this.on("error", callback);
    };

    /**
     * Callback for receiving notification when Promise is aborted.
     *
     * @public
     *
     * @name module:mini-promise.Promise#abort~abortCb
     *
     * @callback module:mini-promise.Promise#abort~abortCb
     * @param {String} reason Reason for abortion.
     */

    /**
     * Register callback for receiving notification when Promise is aborted.
     *
     * @public
     * @method
     *
     * @name module:mini-promise.Promise#abort
     *
     * @param {module:mini-promise.Promise#abort~abortCb} callback The callback function.
     * @returns {module:mini-promise.Promise} Returns promise it self so that on, ready, error and abort can be chained;
     */
    Promise.prototype.abort = function(callback) {
        return this.on("abort", callback);
    };

    function Step(payload) {
        console.assert(payload instanceof Function, "Expecting function, but argument is " + (typeof payload));
        this.payload = null;
        this.p = null;

        this.payload = payload;
    }

    function Sequence() {
        this.steps = [];

        var i = 0;
        var options = {};

        if (! (arguments[0] instanceof Function)) {
            options = arguments[0];
            i = 1;
        }

        options.run = false;

        Promise.prototype.constructor.call(this, options, this.stepper);

        this.listeners.progress = [];

        for(;i < arguments.length; ++i) {
            this.steps.push(new Step(arguments[i]));
        }

        if (this.steps.length === 0) {
            throw new Error("No steps defined for Sequence.");
        }

        this.run();
    }

    Sequence.prototype.__proto__ = Promise.prototype;

    Sequence.prototype.stepper = function(ready, error, abort) {
        var self = this;
        var s = 0;

        function stepReady() {
            var i = 0;
            var length = 0;
            var func = null;
            var progressData = [];
            var data = [];
            var stepIndex = 0;
            for (stepIndex = 0; stepIndex < self.steps.length; ++stepIndex) {
                if (this === self.steps[stepIndex]) {
                    break;
                }
            }

            progressData.push(stepIndex);
            for (i = 0; i < arguments.length; ++i) {
                progressData.push(arguments[i]);
            }

            if (!self.completed) {
                length = self.listeners.progress.length;
                for (i = 0; i < length; ++i) {
                    func = self.listeners.progress[i];
                    func.apply(undefined, progressData);
                }
                if (s < self.steps.length) {
                    runStep(self.steps[s]);
                } else {
                    length = self.steps.length;
                    for (i = 0; i < length; ++i) {
                        data.push(self.steps[i].p.result.data);
                    }
                    self.onReady.apply(self, data);
                }
            }
        }

        function stepAbort(message) {
            abort(message);
        };

        function stepError(err) {
            error(err);
        };

        function runStep(step) {
            console.assert(step instanceof Step, "Received step is not instance of Step.");
            ++s;
            step.p = new Promise({async: true}, step.payload);
            step.p.ready(stepReady.bind(step)).error(stepError.bind(step)).abort(stepAbort.bind(step));
        }

        runStep(this.steps[s]);
    };


    function Parallel() {
        this.steps = [];

        var i = 0;
        var options = {};

        if (! (arguments[0] instanceof Function)) {
            options = arguments[0];
            i = 1;
        }

        options.run = false;

        Promise.prototype.constructor.call(this, options, this.stepper);

        this.listeners.progress = [];

        for(;i < arguments.length; ++i) {
            this.steps.push(new Step(arguments[i]));
        }

        if (this.steps.length === 0) {
            throw new Error("No steps defined for Parallel.");
        }

        this.run();
    }

    Parallel.prototype.__proto__ = Promise.prototype;

    Parallel.prototype.stepper = function(ready, error, abort) {
        var self = this;
        var pending = 0;

        function stepDone() {
            var i = 0;
            var length = 0;
            var event = "ready";
            var data = [];

            if (pending > 0) {
                --pending;

                if (pending === 0) {
                    length = self.steps.length;
                    for (i = 0; i < length; ++i) {
                        if (self.steps[i].p.result.event == "abort") {
                            if (event == "ready") {
                                event = "abort";
                                data = [];
                                data.push(self.steps[i].p.result.data);
                            } else if ( event == "abort") {
                                data.push(self.steps[i].p.result.data);
                            }
                        } else if (self.steps[i].p.result.event == "error") {
                            if (event != "error") {
                                event = "error";
                                data = [];
                                data.push(self.steps[i].p.result.data);
                            } else if (event == "error") {
                                data.push(self.steps[i].p.result.data);
                            }
                        } else {
                            if (event == "ready") {
                                data.push(self.steps[i].p.result.data);
                            }
                        }
                    }
                    if (event == "abort") {
                        abort.apply(self, data);
                    } else if (event == "error") {
                        error.apply(self, data);
                    } else {
                        ready.apply(self, data);
                    }
                }
            } else {
                error(new Error("Got step done when there are no pending steps."));
            }
        }

        function stepReady() {
            var data = [];
            var i = 0;
            var length = 0;
            var func = null;
            var stepIndex = 0;
            for (stepIndex = 0; stepIndex < self.steps.length; ++stepIndex) {
                if (this === self.steps[stepIndex]) {
                    break;
                }
            }
            data.push(stepIndex);
            for (i = 0; i < arguments.length; ++i) {
                data.push(arguments[i]);
            }
            length = self.listeners.progress.length;
            for (i = 0; i < length; ++i) {
                func = self.listeners.progress[i];
                func.apply(undefined, data);
            }
            stepDone.apply(this, data);
        };

        function stepAbort(message) {
            stepDone("abort", message);
        };

        function stepError(err) {
            stepDone("error", err);
        };

        function runStep(step) {
            console.assert(step instanceof Step, "Received step is not instance of Step.");
            step.p = new Promise({async: true}, step.payload);
            step.p.ready(stepReady.bind(step)).error(stepError.bind(step)).abort(stepAbort.bind(step));
        }

        pending = this.steps.length;
        this.steps.forEach(function(step) {
            runStep(step);
        });
    };

    module.exports = {
        Promise: Promise,
        Sequence: Sequence,
        Parallel: Parallel
    };

})(typeof module !== "undefined" ? module : null);
