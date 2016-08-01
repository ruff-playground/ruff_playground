'use strict';

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    var cnt = 0;
    $("#LCD1602-02").turnOn();
    $("#LCD1602-02").print("Hello World!");
    $('#led-r').turnOn();
    $('#CK002').on('push', function() {
    	cnt = cnt + 1;
    	$("#LCD1602-02").clear();
        console.log('Button pushed.');
        $("#LCD1602-02").print("" + cnt+"\n Hello!");
        $('#led-r').turnOn();
    });
});

$.end(function () {
    $('#led-r').turnOff();
    $("#LCD1602-02").clear();
    $("#LCD1602-02").turnOff();
});
