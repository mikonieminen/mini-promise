;(function() {
    Array.prototype.match = function(other) {
        var i = 0;
        for (; i < this.length; ++i) {
            if (this[i] != other[i]) {
                return false;
            }
        }
        return true;
    };

    describe("Promise Tests", function() {
        var Promise = require("../mini-promise.js").Promise;

        it("Test synchronous payload", function(done) {
            var p = new Promise(function(ready, error, abort) {
                var data = ["orange", "pear", "apple"];
                data.sort();
                ready(data);
            });
            p.ready(function(data) {
                if (data.match(["apple", "orange", "pear"])) {
                    done();
                } else {
                    done(new Error("Data recieved in ready callback does not match expected."));
                }
            });
            p.error(function(err) {
                done(err);
            });
            p.abort(function(reason) {
                done(new Error("Promise aborted with reason: " + reason));
            });
        });

        it("Synchronous payload test with async promise", function(done) {
            var p = new Promise({async: true}, function(ready, error, abort) {
                var data = ["orange", "pear", "apple"];
                data.sort();
                ready(data);
            });
            p.ready(function(data) {
                if (data.match(["apple", "orange", "pear"])) {
                    done();
                } else {
                    done(new Error("Data recieved in ready callback does not match expected."));
                }
            });
            p.error(function(err) {
                done(err);
            });
            p.abort(function(reason) {
                done(new Error("Promise aborted with reason: " + reason));
            });
        });

        it("Asynchronous playload test", function(done) {
            var p = new Promise(function(ready, error, abort) {
                var data = ["orange", "pear", "apple"];
                // Wait for 1 second before finishing up.
                // Simulating AJAX request that takes 1 sec.
                setTimeout(function() {
                    data.sort();
                    ready(data);
                }, 1000);
            });
            p.ready(function(data) {
                if (data.match(["apple", "orange", "pear"])) {
                    done();
                } else {
                    done(new Error("Data recieved in ready callback does not match expected."));
                }
            });
            p.error(function(err) {
                done(err);
            });
            p.abort(function(reason) {
                done(new Error("Promise aborted with reason: " + reason));
            });
        });

        it("Asynchronous playload test, that gets aborted", function(done) {
            var p = new Promise(function(ready, error, abort) {
                var data = ["orange", "pear", "apple"];
                // Wait for 2 seconds before finishing up.
                // Simulating AJAX request that takes 2 sec.
                setTimeout(function() {
                    data.sort();
                    ready(data);
                }, 1500);
                // Abort execution after 0.5 seconds.
                setTimeout(function() {
                    abort("cancel");
                }, 500);
            });
            p.ready(function(data) {
                done(new Error("Operation was aborted, ready callback should not be called."));
            });
            p.error(function(err) {
                done(err);
            });
            p.abort(function(reason) {
                done();
            });
        });
    });
})();
