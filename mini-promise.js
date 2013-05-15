(function(module) {

    function Promise(forceAsync, payload) {
        this.forceAsync = false;
        this.payload = null;
        this.completed = false;

        this.listeners = {
            ready: [],
            error: [],
            abort: []
        };

        this.result = {
            event: null,
            data: null
        };

        if (typeof forceAsync === "function" && payload === undefined) {
            this.payload = forceAsync;
        } else if (typeof forceAsync === "boolean" && typeof payload === "function") {
            this.forceAsync = forceAsync;
            this.payload = payload;
        } else {
            throw new Error("Incorrect parameters for creating promise");
        }

        this.run(Promise.prototype.onReady.bind(this),
                 Promise.prototype.onError.bind(this),
                 Promise.prototype.onAbort.bind(this));
    }

    Promise.prototype.onReady = function() {
        var i = 0;
        var length = this.listeners.ready.length;
        var func;

        this.completed = true;
        this.result.event = "ready";
        this.result.data = arguments;

        for (i = 0; i < length; ++i) {
            func = this.listeners.ready.shift();
            func.apply(undefined, arguments);
        }
    };

    Promise.prototype.onError = function() {
        var i = 0;
        var length = this.listeners.error.length;
        var func;

        this.completed = true;
        this.result.event = "error";
        this.result.data = err;

        for (i = 0; i < length; ++i) {
            func = this.listeners.error.shift();
            func.apply(undefined, arguments);
        }
    };

    Promise.prototype.onAbort = function(reason) {
        var i = 0;
        var length = this.listeners.abort.length;
        var func;

        this.completed = true;
        this.result.event = "abort";
        this.result.data = reason;

        for (i = 0; i < length; ++i) {
            func = this.listeners.abort.shift();
            func.apply(undefined, arguments);
        }
    };

    Promise.prototype.run = function(readyCb, errorCb, abortCb) {
        var self = this;
        if (this.forceAsync) {
            setTimeout(function() {
                self.payload(readyCb, errorCb, abortCb);
            }, 0);
        } else {
            this.payload(readyCb, errorCb, abortCb);
        }
    };

    Promise.prototype.on = function(event, callback) {
        if (!this.completed) {
            if (this.listeners[event] === undefined) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        } else if (this.result.event === event) {
            callback.apply(undefined, this.result.data);
        }
    };

    Promise.prototype.ready = function(callback) {
        if (!this.completed) {
            this.listeners.ready.push(callback);
        } else if (this.result.event === "ready") {
            callback.apply(undefined, this.result.data);
        }
    };

    Promise.prototype.error = function(callback) {
        if (!this.completed) {
            this.listeners.error.push(callback);
        } else if (this.result.event === "error") {
            callback.apply(undefined, this.result.data);
        }
    };

    Promise.prototype.abort = function(callback) {
        if (!this.completed) {
            this.listeners.abort.push(callback);
        } else if (this.result.event === "abort") {
            callback.apply(undefined, this.result.data);
        }
    };

    module.exports = {
        Promise: Promise
    };

})(typeof module !== "undefined" ? module : null);
