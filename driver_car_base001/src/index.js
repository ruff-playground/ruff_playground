'use strict';

var Level = require('gpio').Level;
var driver = require('ruff-driver');

module.exports = driver({
    /**
     * @param {Object} inputs A map of assigned interfaces according to `driver.json`.
     * @param {Object} context Context of this instance to attach.
     * @param {string} context.id ID of the device.
     * @param {string} context.model Model of the device.
     * @param {Object} context.args A map of device arguments.
     * @param {Function} callback If the third parameter is added, it's the callback for asyncrhonous attaching.
     */
    attach: function (inputs, context/*, callback */) {
        // Get assigned GPIO interface and set property `_gpio`.
        // See https://ruff.io/zh-cn/api/gpio.html for more information about GPIO interfaces.
        this._left_front = inputs['left_front'];
        this._left_back  = inputs['left_back'];
        this._right_front  = inputs['right_front'];
        this._right_back  = inputs['right_back'];
        this._setLevels=function(lf, lb, rf, rb, callback){
            this._left_front.write(lf, callback);
            this._left_back.write(lb, callback);
            this._right_front.write(rf, callback);
            this._right_back.write(rb, callback);
        }

    },
    exports: {
        stop: function (callback) {
            this._setLevels(Level.low, Level.low, Level.low, Level.low, callback);
        },
        moveFront: function (callback) {
            this._setLevels(Level.high, Level.low, Level.high, Level.low, callback);
        },
        moveBack:function (callback) {
            this._setLevels(Level.low, Level.high, Level.low, Level.high, callback);
        },
        turnLeft:function (callback) {
            this._setLevels(Level.low, Level.high, Level.high, Level.low, callback);
        },
        turnRight:function (callback) {
            this._setLevels(Level.high, Level.low, Level.low, Level.high, callback);
        },
        turnLeftA:function (callback) {
            this._setLevels(Level.low, Level.high, Level.low, Level.low, callback);
        },
        turnLeftB:function (callback) {
            this._setLevels(Level.low, Level.low, Level.high, Level.low, callback);
        },
        turnRightA:function (callback) {
            this._setLevels(Level.low, Level.low, Level.low, Level.high, callback);
        },
        turnRightB:function (callback) {
            this._setLevels(Level.high, Level.low, Level.low, Level.low, callback);
        },
    }
});
