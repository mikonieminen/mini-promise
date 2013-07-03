;(function() {
    var Parallel = require('../mini-promise.js').Parallel;

    function Validator(expects, done) {
        this.expects = {};
        for (key in expects) {
            this.expects[key] = { expectedCount: expects[key], count: 0 };
        }
        this.done = done;
        this.allDone = false;
    }

    Validator.prototype.resolved = function(item) {
        var doneExpects = 0;
        console.assert(!this.allDone, "Got event after all expected"
                       + " events are already received.");
        if (item && this.expects[item]) {
            if (this.expects[item].count >= this.expects[item].expectedCount) {
                this.done(new Error("Expecting " + this.expects[item].expectedCount + " of " + item + ", but got one more."));
            }
            this.expects[item].count++;
            for (key in this.expects) {
                if (this.expects[key].count === this.expects[key].expectedCount) {
                    doneExpects++;
                }
            }
            if (doneExpects === Object.keys(this.expects).length) {
                this.allDone = true;
                this.done();
            }
        } else {
            this.done(new Error("Unexpected item resolved: " + item));
        }
    }

    describe("Parallel Tests", function() {
        it("Single synchronous payload function. Results with ready event after progress event.", function(done) {
            var e = {
                progress: 1,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                // Will not get progress for this one since this is synchronous.
                ready("car");
            });
            p.on("ready", function(first) {
                if (first.length === 1 && first[0] === "car") {
                    v.resolved("ready");
                } else {
                    done(new Error("Data passed in \"ready\" does not match with expected."));
                }
            });
            p.on("progress", function(index, item) {
                if (index === 0 && item === "car") {
                    v.resolved("progress");
                } else {
                    console.error("Invalid data for progress: %o", item);
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Two synchronous payload functions. Results with ready event after two progress events.", function(done) {
            var e = {
                progress: 2,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                ready("car");
            }, function(ready, error, abort) {
                ready("train");
            });
            p.on("ready", function(first, second) {
                if (first.length === 1 && first[0] === "car" &&
                    second.length === 1 && second[0] === "train") {
                    v.resolved("ready");
                } else {
                    done(new Error("Data passed in \"ready\" does not match with expected."));
                }
            });
            p.on("progress", function(i, item) {
                if (i === 0 && item === "car" || i === 1 && item === "train") {
                    v.resolved("progress");
                } else {
                    console.error("Data passed in \"progress\" does not match with expected: %d, %o", i, item);
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three synchronous payload functions. Results with ready event after three progress events.", function(done) {
            var e = {
                progress: 3,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                ready("car");
            }, function(ready, error, abort) {
                ready("train");
            }, function(ready, error, abort) {
                ready("boat");
            });
            p.on("ready", function(first, second, third) {
                if (first.length === 1 && first[0] === "car" &&
                    second.length === 1 && second[0] === "train" &&
                    third.length === 1 && third[0] === "boat") {
                    v.resolved("ready");
                } else {
                    done(new Error("Data passed in \"ready\" does not match with expected."));
                }
            });
            p.on("progress", function(i, item) {
                if (i === 0 && item === "car" || i === 1 && item === "train" || i === 2 && item === "boat") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Single asynchronous payload function. Results with progress event and ready.", function(done) {
            var e = {
                progress: 1,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            });
            p.on("ready", function(first) {
                if (first.length === 1 && first[0] === "car") {
                    v.resolved("ready");
                } else {
                    done(new Error("Data received in \"ready\" does not match with expected."));
                }
            });
            p.on("progress", function(i, items) {
                if (i === 0 && items === "car") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Two asynchronous payload functions. Results with two progress events and ready.", function(done) {
            var e = {
                progress: 2,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("train");
                }, 0);
            });
            p.on("ready", function(first, second) {
                if (first.length === 1 && first[0] === "car" && second.length === 1 && second[0] === "train") {
                    v.resolved("ready");
                } else {
                    done(new Error("Data received in \"ready\" does not match with expected."));
                }
            });
            p.on("progress", function(i, items) {
                if (i === 0 && items === "car" || i === 1 && items === "train") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three asynchronous payload functions. Results with 3 progress events and ready.", function(done) {
            var e = {
                progress: 3,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("train");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("boat");
                }, 0);
            });
            p.on("ready", function(first, second, third) {
                if (first.length === 1 && first[0] === "car" &&
                    second.length === 1 && second[0] === "train" &&
                    third.length === 1 && third[0] === "boat") {
                    v.resolved("ready");
                } else {
                    done(new Error("Data received in \"ready\" does not match with expected."));
                }
            });
            p.on("progress", function(i, items) {
                if (i === 0 && items === "car" || i === 1 && items === "train" || i === 2 && items === "boat") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three asynchronous payload functions, first failing. Results with error.", function(done) {
            var e = {
                progress: 2,
                error: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    error(new Error("Failed"));
                }, 100);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("train");
                }, 30);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("boat");
                }, 80);
            });
            p.on("ready", function(first, second, third) {
                done(new Error("Should not get ready, when failing."));
            });
            p.on("progress", function(i, items) {
                if (i === 1 && items === "train" || i === 2 && items === "boat") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                v.resolved("error");
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three asynchronous payload functions, second failing. Results with progress event and error.", function(done) {
            var e = {
                progress: 2,
                error: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    error(new Error("Failed"));
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("boat");
                }, 0);
            });
            p.on("ready", function(first, second, third) {
                done(new Error("Should not get ready, when failing."));
            });
            p.on("progress", function(i, items) {
                if (i === 0 && items === "car" || i === 2 && items === "boat") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                v.resolved("error");
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three asynchronous payload functions, third failing. Results with two progress events and error.", function(done) {
            var e = {
                progress: 2,
                error: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("train");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    error(new Error("Failed"));
                }, 0);
            });
            p.on("ready", function(first, second, third) {
                done(new Error("Should not get ready, when failing."));
            });
            p.on("progress", function(i, items) {
                if (i === 0 && items === "car" || i === 1 && items === "train") {
                    v.resolved("progress");
                } else {
                    done(new Error("Data passed in \"progress\" does not match with expected."));
                }
            });
            p.on("error", function(err) {
                v.resolved("error");
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three synchronous payload functions, second failing. Results with two progress events and error.", function(done) {
            var e = {
                progress: 2,
                error: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                ready("car");
            }, function(ready, error, abort) {
                error(new Error("Failed"));
            }, function(ready, error, abort) {
                ready("boat");
            });
            p.on("ready", function(first, second, third) {
                done(new Error("Should not get ready, when failing."));
            });
            p.on("progress", function(items) {
                v.resolved("progress");
            });
            p.on("error", function(err) {
                v.resolved("error");
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Three asynchronous payload functions, third aborted. Results with two progress events and abort.", function(done) {
            var e = {
                progress: 2,
                abort: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("train");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    abort("Abort");
                }, 0);
            });
            p.on("ready", function(first, second, third) {
                done(new Error("Should not get ready, when sequence is failing."));
            });
            p.on("progress", function(items) {
                v.resolved("progress");
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                v.resolved("abort");
            });
        });
        it("Synchronous and two asynchronous payload functions. Results with three progress events and ready.", function(done) {
            var e = {
                progress: 3,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                // Will not get progress for this one since this is synchronous.
                ready("car");
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("train");
                }, 0);
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("boat");
                }, 0);
            });
            p.on("ready", function(first, second, third) {
                v.resolved("ready");
            });
            p.on("progress", function(items) {
                v.resolved("progress");
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
        it("Asynchronous, synchronous and asynchronous payload functions. Results with three progress events and ready.", function(done) {
            var e = {
                progress: 3,
                ready: 1
            };
            var v = new Validator(e, done);
            var p = new Parallel(function(ready, error, abort) {
                setTimeout(function() {
                    ready("car");
                }, 0);
            }, function(ready, error, abort) {
                // Gives progress event since there is asynchronous item before this one.
                ready("train");
            }, function(ready, error, abort) {
                setTimeout(function() {
                    ready("boat");
                }, 0);
            });
            p.on("ready", function(first, second, third) {
                v.resolved("ready");
            });
            p.on("progress", function(items) {
                v.resolved("progress");
            });
            p.on("error", function(err) {
                done(err);
            });
            p.on("abort", function(reason) {
                done(new Error("Got unexpected abort."));
            });
        });
    });
})();
