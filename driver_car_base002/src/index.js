'use strict';
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
        var checkDuty = function(d){
            if(d < 0){
                return 0;
            }
            if(d > 1){
                return 1;
            }
            return d;
        }
        this._setDuties=function(lf, lb, rf, rb, callback){

            this._left_front.setDuty(checkDuty(lf), callback);
            this._left_back.setDuty(checkDuty(lb), callback);
            this._right_front.setDuty(checkDuty(rf), callback);
            this._right_back.setDuty(checkDuty(rb), callback);
        }

    },
    exports: {
        stop: function (callback) {
            this._setDuties(0, 0, 0, 0, callback);
        },
        setSpeed:function(x, y, callback){
            var lf = 0,lb = 0,rf = 0,rb = 0;
            if(y >= 0){
                lf=y;
                rf=y;
                if(x>0){
                    rf= rf - x;
                }else{
                    lf= lf + x;
                }
            }else{
                lb=-y;
                rb=-y;
                if(x>0){
                    rb= rf - x;
                }else{
                    lb= lf + x;
                }
            }

        },
        moveFront: function (callback) {
            this._setDuties(1, 0, 1, 0, callback);
        },
        moveBack:function (callback) {
            this._setDuties(0, 1, 0, 1, callback);
        },
        turnLeft:function (callback) {
            this._setDuties(0, 1, 1, 0, callback);
        },
        turnRight:function (callback) {
            this._setDuties(1, 0, 0, 1, callback);
        },
        turnLeftA:function (callback) {
            this._setDuties(0, 1, 0, 0, callback);
        },
        turnLeftB:function (callback) {
            this._setDuties(0, 0, 1, 0, callback);
        },
        turnRightA:function (callback) {
            this._setDuties(0, 0, 0, 1, callback);
        },
        turnRightB:function (callback) {
            this._setDuties(1, 0, 0, 0, callback);
        },
    }
});
