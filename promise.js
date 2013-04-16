
function Promise(forceAsync, payload) {
    this.forceAsync = false;
    this.payload = null;

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

Promise.prototype.onReady = function(data) {
    var i = 0;
    var length = this.listeners.ready.length;

    this.result.event = "ready";
    this.result.data = data;

    for (i = 0; i < length; ++i) {
        this.listeners.ready[i].apply(data);
    }
};

Promise.prototype.onError = function(err) {
    var i = 0;
    var length = this.listeners.error.length;

    this.result.event = "error";
    this.result.data = err;

    for (i = 0; i < length; ++i) {
        this.listeners.error[i].apply(err);
    }
};

Promise.prototype.onAbort = function(reason) {
    var i = 0;
    var length = this.listeners.abort.length;

    this.result.event = "abort";
    this.result.data = reason;

    for (i = 0; i < length; ++i) {
        this.listeners.abort[i].apply(reason);
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
    if (this.result.event === null) {
        if (this.listeners[event] === undefined) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    } else if (this.result.event === event) {
        callback(this.result.data);
    }
};

Promise.prototype.ready = function(callback) {
    if (this.result.event === null) {
        this.listeners.ready.push(callback);
    } else if (this.result.event === "ready") {
        callback(this.result.data);
    }
};

Promise.prototype.error = function(callback) {
    if (this.result.event === null) {
        this.listeners.error.push(callback);
    } else if (this.result.event === "error") {
        callback(this.result.data);
    }
};

Promise.prototype.abort = function(callback) {
    if (this.result.event === null) {
        this.listeners.abort.push(callback);
    } else if (this.result.event === "abort") {
        callback(this.result.data);
    }
};

module.exports = Promise;
