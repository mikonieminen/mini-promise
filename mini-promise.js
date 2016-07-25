;(function (exports) {
    "use strict";

    var State = {
        PENDING: 0,
        FULFILLED: 2,
        REJECTED: 3
    };

    function resolve(promise, x) {
        if (promise.state === State.FULFILLED || promise.state === State.REJECTED) {
            return;
        }
        if (promise === x) { // 2.3.1
            promise.done = true;
            promise.state = State.REJECTED;
            promise.value = new TypeError("Resolving promise with it self is not allowed");
            purgeWaiting(promise);
        } else if (x instanceof PolyfilPromise) { // 2.3.2
            x.then(function (value) { // 2.3.2.2
                resolve(promise, value);
            }, function (reason) { // 2.3.2.3
                reject(promise, reason);
            });
        } else if (x && (typeof x === "object" || typeof x === "function")) { // 2.3.3
            var then = null;
            var called = false;
            try {
                then = x.then; // 2.3.3.1
            } catch (e) { // 2.3.3.2
                promise.done = true;
                promise.state = State.REJECTED;
                promise.value = e;
                purgeWaiting(promise);
                return;
            }
            if (typeof then === "function") { // 2.3.3.3
                var called = false;
                try {
                    then.call(x, function (value) { // 2.3.3.3.1
                        if (called) return; // 2.2.2.3
                        resolve(promise, value);
                        called = true;
                    }, function (reason) { // 2.3.3.3.2
                        if (called) return; // 2.2.3.3
                        reject(promise, reason);
                        called = true;
                    });
                } catch (e) { // 2.3.3.3.4
                    if (!called) { // 2.3.3.3.4.1 && 2.3.3.3.4.2
                        promise.done = true;
                        promise.state = State.REJECTED;
                        promise.value = e;
                        purgeWaiting(promise);
                    }
                }
            } else { // 2.3.3.4
                promise.done = true;
                promise.state = State.FULFILLED;
                promise.value = x;
                purgeWaiting(promise);
            }
        } else { // 2.3.4
            promise.done = true;
            promise.state = State.FULFILLED;
            promise.value = x;
            purgeWaiting(promise);
        }
    }

    function reject(promise, reason) {
        if (promise.state === State.FULFILLED || promise.state === State.REJECTED) {
            return; // 2.2.2.3
        }
        promise.done = true;
        promise.state = State.REJECTED;
        if (promise === reason) {
            promise.value = new TypeError("Promise cannot be reject with self as reason");
        } else {
            promise.value = reason;
        }
        purgeWaiting(promise);
    }

    function purgeWaiting(promise) {
        var item = null;
        var a = null;
        if (promise.done) {
            a = promise.pending;
            while (item = a.shift()) {
                setTimeout(function (p, fn) {
                    if (typeof fn === "function") {
                        try {
                            var ret = fn(promise.value);
                            resolve(p, ret);
                        } catch (e) {
                            reject(p, e);
                        }
                    } else {
                        if (promise.state === State.FULFILLED) {
                            resolve(p, promise.value);
                        } else if (promise.state === State.REJECTED) {
                            reject(p, promise.value);
                        }
                    }
                }, 0, item.p, (promise.state === State.FULFILLED ? item.f : item.r));
            }
        }
    }

    function PolyfilPromise(payload) {
        this.done = false;
        this.state = State.PENDING;
        this.value = null;
        this.pending = [];
        if (payload instanceof Function) {
            try  {
                var ret = payload(PolyfilPromise.prototype.resolve.bind(this), PolyfilPromise.prototype.reject.bind(this));
                if (ret !== undefined) {
                    // FIXME: raise error if used
                    // this is not supported by native Promises
                    resolve(this, ret);
                }
            } catch (e) {
                reject(this, e);
            }
        } else if (payload !== undefined) {
            // FIXME: raise error if used
            // this is not supported by native Promises
            resolve(this, payload);
        }
    }

    PolyfilPromise.prototype.then = function (onFulfilled, onRejected) {
        var promise = new PolyfilPromise();

        var obj = {
            f: (typeof onFulfilled === "function") ? onFulfilled : null, // 2.2.1.1
            r: (typeof onRejected === "function") ? onRejected : null, // 2.2.1.2
            p: promise
        };

        this.pending.push(obj);

        if (this.done) {
            purgeWaiting(this);
        }

        return promise; // 2.2.7
    };

    PolyfilPromise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };

    PolyfilPromise.prototype.resolve = function (value) {
        // FIXME: raise error if used
        // this is not supported by native Promises
        resolve(this, value);
    };

    PolyfilPromise.prototype.reject = function (value) {
        // FIXME: raise error if used
        // this is not supported by native Promises
        reject(this, value);
    };

    PolyfilPromise.cast = function (obj) {
        if (obj instanceof PolyfilPromise) {
            return obj;
        } else {
            return new PolyfilPromise(function (resolve, reject) {
                resolve(obj);
            });
        }
    };

    PolyfilPromise.resolve = function (value) {
        return new PolyfilPromise(function (resolve, reject) {
            resolve(value);
        });
    };

    PolyfilPromise.reject = function (reason) {
        return new PolyfilPromise(function (resolve, reject) {
            reject(reason);
        });
    };

    PolyfilPromise.all = function (promises) {
        return new PolyfilPromise(function (resolve, reject) {
            var values = [];
            var done = 0;
            for (var i = 0; i < promises.length; ++i) {
                PolyfilPromise.cast(promises[i]).then((function (n, value) {
                    values[n] = value;
                    if (++done === promises.length) {
                        resolve(values);
                    }
                }).bind(undefined, i), function (reason) {
                    reject(reason);
                });
            }
        });
    };

    PolyfilPromise.race = function (promises) {
        return new PolyfilPromise(function (resolve, reject) {
            for (var i = 0; i < promises.length; ++i) {
                PolyfilPromise.cast(promises[i]).then((function (n, value) {
                    resolve(value);
                }).bind(undefined, i), function (reason) {
                    reject(reason);
                });
            }
        });
    };

    // This does not work in Chrome, Firefox or Node.js
    // Based on my tests, each of these fail the test suite's
    // test cases where Promise is resolved by returning
    // value synchronously.
    // exports.Promise = Promise ? Promise : PolyfilPromise;
    exports.Promise = PolyfilPromise;

})(typeof exports !== undefined ? exports : this);
