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
                return Promise.resolve(value);
            },
            rejected: function (reason) {
                return Promise.reject(reason);
            }
        };

        require("promises-aplus-tests").mocha(adapter);
    });
})();
