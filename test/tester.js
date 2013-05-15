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
        console.log(testRunner + ", ready with data: ", data);
    };

    Tester.prototype.error = function(err) {
        console.log("Test runner, error: ", err);
    };

    Tester.prototype.abort = function(reason) {
        console.log("Test runner, abort: ", reason);
    };

    Tester.prototype.run = function() {
        console.log("Tester run: " + this.name);
        var p;

        if (this.forceAsync) {
            p = new promise.Promise(true, this.payload);
        } else {
            p = new promise.Promise(this.payload);
        }

        // Make sure that callback has right context
        // Also shows howto pass static information to callback
        p.ready(Tester.prototype.handler.bind(this, "ready"));
        p.error(Tester.prototype.handler.bind(this, "error"));
        p.abort(Tester.prototype.handler.bind(this, "abort"));

        // Version where one cannot trust callback context
        p.ready(this.ready);
        p.error(this.error);
        p.abort(this.abort);

        return p;
    };

    var tester = new Tester("Testrunner 1: Synchronous payload test", false, function(readyCb, errorCb, abortCb) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 1: start.");
        console.log("Testrunner 1: do my work.");
        data.sort();
        console.log("Testrunner 1: notify ready.");
        readyCb("Testrunner 1", data);
        console.log("Testrunner 1: done.");
    });

    var p = tester.run();

    // Inline function as callback
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
    });

    delete tester;
    delete p;

    tester = new Tester("Testrunner 2: Synchronous payload test with async promise", true, function(readyCb, errorCb, abortCb) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 2: start.");
        console.log("Testrunner 2: do my work.");
        data.sort();
        console.log("Testrunner 2: notify ready.");
        readyCb("Testrunner 2", data);
        console.log("Testrunner 2: done.");
    });

    p = tester.run();

    // Inline function as callback
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
    });

    delete tester;
    delete p;

    tester = new Tester("Testrunner 3: Asynchronous playload test", false, function(readyCb, errorCb, abortCb) {
        var data = ["orange", "pear", "apple"];
        console.log("Testrunner 3: start");
        console.log("Testrunner 3: do my work.");
        // Wait for 1.5 seconds before finishing up.
        // Simulating AJAX request that takes 1.5 sec.
        setTimeout(function() {
            data.sort();
            console.log("Testrunner 3: notify ready.");
            readyCb("Testrunner 3", data);
            console.log("Testrunner 3: done.");
        }, 1500);
    });

    p = tester.run();
    p.ready(function(testRunner, data) {
        console.log(testRunner + ", inline ready callback, data: ", data);
    });

    delete tester;
    delete p;
})();
