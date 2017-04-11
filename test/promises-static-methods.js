;(function () {
    var Promise = require('../mini-promise.js').Promise;

    describe('Promise.cast', function () {
        it('actual Promise', function (done) {
            var dummy = { dummy: "dummy" };
            var sentinel = new Promise(function (resolve, reject) {
                resolve(dummy);
            });
            var p = Promise.cast(sentinel);
            if (p === sentinel) {
                done();
            } else {
                done(new Error("unexpected return value"));
            }
        });
        it('non-Promise', function (done) {
            var sentinel = { sentinel: "sentinel" };
            var p = Promise.cast(sentinel);
            if (p !== sentinel && p instanceof Promise) {
                var p2 = p.then(function (value) {
                    if (value === sentinel) {
                        done();
                    } else {
                        done(new Error("Returned promise was resolved with unexpected value"));
                    }
                });
                p2.catch(function (reason) {
                    done(reason);
                });
            } else {
                done(new Error("unexpected return value"));
            }
        });
    });

    describe('Promise.resolve', function () {
        describe('getting fulfilled', function () {
            it('resolve with value', function (done) {
                var sentinel = { sentinel: "sentinel" };
                var p = Promise.resolve(sentinel);
                var p2 = p.then(function (value) {
                    if (value === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise was resolved with unexpected value"));
                    }
                });
                p2.catch(function (reason) {
                    done(reason);
                });
            });
        });
    });

    describe('Promise.reject', function () {
        describe('getting rejected', function () {
            it('reject with Error', function (done) {
                var sentinel = new Error();
                var p = Promise.reject(sentinel);
                var p2 = p.catch(function (value) {
                    if (value === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise was resolved with unexpected value"));
                    }
                });
                p2.catch(function (reason) {
                    done(reason);
                });
            });
        });
    });

    describe('Promise.all', function () {
        describe('getting fulfilled', function () {
            var sentinel = { sentinel: "sentinel" };
            it('three promises resolving value asynchronously', function (done){
                var p = Promise.all([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(sentinel);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(sentinel);
                        }, 104);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(sentinel);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    if (value instanceof Array &&
                        value.length === 3 &&
                        value[0] === sentinel &&
                        value[1] === sentinel &&
                        value[2] === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise resolved with unexpected value: ", value));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
            it('three promises resolving both synchronously and asynchronously', function (done){
                var p = Promise.all([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(sentinel);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        resolve(sentinel);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(sentinel);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    if (value instanceof Array &&
                        value.length === 3 &&
                        value[0] === sentinel &&
                        value[1] === sentinel &&
                        value[2] === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise resolved with unexpected value: ", value));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
        });
        describe('getting rejected', function(){
            var dummy = { dummy: "dummy" };
            var sentinel = new Error("sentinel");
            it('three promises, one failing by throwing', function (done){
                var p = Promise.all([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        throw sentinel;
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    done(new Error("Promise should be rejected, not resolved"));
                }, function (reason) {
                    if (reason === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise rejected with unexpected reason: ", reason));
                    }
                });
            });
            it('three promises, one failing by reject', function (done){
                var p = Promise.all([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        reject(sentinel);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    done(new Error("Promise should be rejected, not resolved"));
                }, function (reason) {
                    if (reason === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise rejected with unexpected reason: ", reason));
                    }
                });
            });
        });
    });

    describe('Promise.race', function (){
        describe('getting fulfilled', function (){
            var dummy = { dummy: "dummy" };
            var sentinel = { sentinel: "sentinel" };
            it('three promises resolving value asynchronously', function (done){
                var p = Promise.race([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 104);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(sentinel);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    if (value === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise resolved with unexpected value: ", value));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
            it('three promises resolving both synchronously and asynchronously', function (done){
                var p = Promise.race([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        resolve(sentinel);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    if (value === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise resolved with unexpected value: ", value));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
        });
        describe('getting rejected', function(){
            var dummy = { dummy: "dummy" };
            var sentinel = new Error("sentinel");
            it('three promises, one failing by throwing', function (done){
                var p = Promise.race([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        throw sentinel;
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    done(new Error("Promise should be rejected, not resolved"));
                }, function (reason) {
                    if (reason === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise rejected with unexpected reason: ", reason));
                    }
                });
            });
            it('three promises, one failing by reject', function (done){
                var p = Promise.race([
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 100);
                    }),
                    new Promise(function (resolve, reject) {
                        reject(sentinel);
                    }),
                    new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(dummy);
                        }, 110);
                    })
                ]);
                p.then(function (value) {
                    done(new Error("Promise should be rejected, not resolved"));
                }, function (reason) {
                    if (reason === sentinel) {
                        done();
                    } else {
                        done(new Error("Promise rejected with unexpected reason: ", reason));
                    }
                });
            });
        });
    });
})();
