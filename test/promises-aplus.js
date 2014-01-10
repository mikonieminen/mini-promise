;(function () {
    "use strict";

    var Promise = require("../mini-promise.js").Promise;

    describe("Promise/A+ tests", function () {
        beforeEach(function () {
            Promise.seq = 0;
        });

        var adapter = {
            deferred: function () {
                var rs, rj;
                var promise = new Promise(function (resolve, reject) {
                    rs = resolve;
                    rj = reject;
                });
                return {
                    promise: promise,
                    resolve: rs,
                    reject: rj
                };
            },
            resolved: function (value) {
                var p = new Promise(value);
                p.resolve(value);
                return p;
            },
            rejected: function (reason) {
                var p = new Promise();
                p.reject(reason);
                return p;
            }
        };

        require("promises-aplus-tests").mocha(adapter);
    });
})();
