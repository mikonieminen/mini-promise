(function() {
    var promise = require("../mini-promise.js");

    function Tester(name, async, payload) {
        this.name = name;
        this.payload = payload;
        this.forceAsync = async;
    }

    Tester.prototype.handler = function() {
        var res = Array.prototype.splice.call(arguments, 0, 1);
        console.log("Test runner, event: %s, arguments: ", res, arguments);
    };

    Tester.prototype.ready = function(testRunner, data) {
        if (this instanceof Tester) {
            console.log(testRunner + ", ready with data: ", data);
        } else {
            throw new Error("Incorrect context. This is not Tester.");
        }
    };

    Tester.prototype.error = function(err) {
        if (this instanceof Tester) {
            console.log("Test runner, error: ", err);
        } else {
            throw new Error("Incorrect context. This is not Tester.");
        }
    };

    Tester.prototype.abort = function(reason) {
        if (this instanceof Tester) {
            console.log("Test runner, abort: ", reason);
        } else {
            throw new Error("Incorrect context. This is not Tester.");
        }
    };

    Tester.prototype.run = function() {
        console.log("Tester run: " + this.name);
        var p;

        if (this.forceAsync === true) {
            p = new promise.Promise({async: true}, this.payload);
        } else {
            p = new promise.Promise(this.payload);
        }

        p.ready(this.ready.bind(this));
        p.error(this.error.bind(this));
        p.abort(this.abort.bind(this));

        return p;
    };

    var tester = new Tester("Testrunner 1: Synchronous payload test", false, function(ready, error, abort) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 1: start.");
        console.log("Testrunner 1: do my work.");
        data.sort();
        console.log("Testrunner 1: notify ready.");
        ready("Testrunner 1", data);
        console.log("Testrunner 1: done.");
    });

    var p = tester.run();

    // Inline function as callback
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
    });

    delete tester;
    delete p;

    tester = new Tester("Testrunner 2: Synchronous payload test with async promise", true, function(ready, error, abort) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 2: start.");
        data.sort();
        ready("Testrunner 2", data);
    });

    p = tester.run();

    // Inline function as callback
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
    });

    delete tester;
    delete p;

    tester = new Tester("Testrunner 3: Asynchronous playload test", false, function(ready, error, abort) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 3: start");
        // Wait for 1.5 seconds before finishing up.
        // Simulating AJAX request that takes 1.5 sec.
        setTimeout(function() {
            data.sort();
            ready("Testrunner 3", data);
        }, 1500);
    });

    p = tester.run();
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
    }).error(function(err) {
        console.log("Error: ", err);
    }).abort(function(reason) {
        console.log("Aborted: " + reason);
    });

    delete tester;
    delete p;
    tester = new Tester("Testrunner 4: Asynchronous playload test, that gets aborted", false, function(ready, error, abort) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 4: start");
        // Wait for 2 seconds before finishing up.
        // Simulating AJAX request that takes 2 sec.
        setTimeout(function() {
            data.sort();
            ready("Testrunner 4", data);
        }, 2000);
        // Abort execution after 0.5 seconds.
        setTimeout(function() {
            abort("Testrunner 4: abort.");
        }, 500);
    });

    p = tester.run();
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
        throw new Error("This should not be called.");
    }).error(function(err) {
        console.log("Got error: ", err);
        throw new Error("This should not be called.");
    }).abort(function(reason) {
        console.log("Got abort: " + reason);
    });

    delete tester;
    delete p;
})();
