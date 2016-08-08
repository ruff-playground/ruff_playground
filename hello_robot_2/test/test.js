'use strict';

var assert = require('assert');
var path = require('path');
var test = require('test');

var appRunner = require('ruff-app-runner');
var mock = require('ruff-mock');

var verify = mock.verify;

var appPath = path.join(__dirname, '..');

module.exports = {
    'test fifo': function (done) {
            var test=[];
            test.unshift(1);
            test.unshift(2);
            test.unshift(3);
            console.log(test.pop())
            console.log(test.pop())
            console.log(test.pop())
            done();
    },
    'test should run application': function (done) {
        appRunner
            .run(appPath, function () {
                verify($('#led-r')).turnOn();
            })
            .end(function () {
                verify($('#led-r')).turnOff();
                done();
            });
    }
};

test.run(module.exports);
