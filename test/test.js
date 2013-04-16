var Promise = require("../promise.js");

var p = new Promise(function(doneCb, errorCb, abortCb) {
    console.log("Start...");
    setTimeout(function() {
        console.log("...end.");
        doneCb();
    }, 3000);
});

p.done(function(data) {
    console.log("Promise: done. Data: ", data);
});

p.error(function(err) {
    console.log("Promise: error. Error: ", err);
});

p.abort(function(reason) {
    console.log("Promise: abort. Reason: ", reason);
});

