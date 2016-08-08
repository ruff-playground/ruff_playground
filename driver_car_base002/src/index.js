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
        this._baseRate = 1;
        this._d_lf = 0;
        this._d_lb = 0;
        this._d_rf = 0;
        this._d_rb = 0; 
        var checkDuty = function(d){
            if(d < 0){
                return 0;
            }
            if(d > 1){
                return 1;
            }
            return d;
        }
        this._setDutiesAndCache = function(lf, lb, rf, rb, callback){
            this._d_lf = lf;
            this._d_lb = lb;
            this._d_rf = rf;
            this._d_rb = rb;
            this._setDuties(lf, lb, rf, rb);
        }
        this._setDuties = function(lf, lb, rf, rb, callback){
            this._left_front.setDuty(checkDuty(lf) * this._baseRate, callback);
            this._left_back.setDuty(checkDuty(lb) * this._baseRate, callback);
            this._right_front.setDuty(checkDuty(rf) * this._baseRate, callback);
            this._right_back.setDuty(checkDuty(rb) * this._baseRate, callback);
        }
        this._isStoped = function(){
            return this._d_lf === 0 && 
            this._d_lb === 0 && 
            this._d_rf === 0 && 
            this._d_rb === 0 ;
        }

    },
    exports: {
        stop: function (callback) {
            if(this._isStoped()){
                return;
            }
            this._setDutiesAndCache(0, 0, 0, 0, callback);
        },
        setBaseRate: function(baseRate){
            this._baseRate = baseRate;
            this._setDuties(this._d_lf, this._d_lb, this._d_rf, this._d_rb);
        },
        setSpeed:function(x, y, callback){
            var lf = 0,lb = 0,rf = 0,rb = 0;
            if(y >= 0){
                lf = y;
                rf = y;
                if(x > 0){
                    rf = rf - x;
                    lf = lf + x;
                }else{
                    lf = lf + x;
                    rf = rf - x;
                }
            } else {
                lb = 0 - y;
                rb = 0 - y;
                if(x > 0){
                    rb = rb - x;
                    lb = lb + x;
                }else{
                    lb = lb + x;
                    rb = rb - x;
                }
            }
            //console.log("lf:"+lf+"lb:"+lb+"rf:"+rf+"rb:"+rb)
            this._setDutiesAndCache(lf, lb, rf, rb);

        },
        moveFront: function (callback) {
            this.setSpeed(0, 1, callback);
        },
        moveBack:function (callback) {
            this.setSpeed(0, -1, callback);
        },
        turnLeft:function (callback) {
            this.setSpeed(1, 0, callback);
        },
        turnRight:function (callback) {
            this.setSpeed(-1, 0, callback);
        },
        turnLeftA:function (callback) {
            this._setDutiesAndCache(0, 1, 0, 0, callback);
        },
        turnLeftB:function (callback) {
            this._setDutiesAndCache(0, 0, 1, 0, callback);
        },
        turnRightA:function (callback) {
            this._setDutiesAndCache(0, 0, 0, 1, callback);
        },
        turnRightB:function (callback) {
            this._setDutiesAndCache(1, 0, 0, 0, callback);
        },
    }
});
