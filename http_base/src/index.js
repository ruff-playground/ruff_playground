'use strict';
var http = require("http");
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
        $("#LCD1602-02").clear();
        cnt = cnt + 1;
        console.log('Button pushed.');
        http.get("http://10.17.5.33:9005/api/quartz/random", function(res) {
            console.log("Got response: " + res.statusCode);
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log(chunk);
                $("#LCD1602-02").setCursor(0,0);
                $("#LCD1602-02").print(chunk);
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });

        //$("#LCD1602-02").setCursor(0,0);
        //$("#LCD1602-02").print("" + cnt);
        $("#LCD1602-02").setCursor(0,1);
        $("#LCD1602-02").print("randomName show!");
        $('#led-r').turnOn();
    });
});

$.end(function () {
    $('#led-r').turnOff();
    $("#LCD1602-02").clear();
    $("#LCD1602-02").turnOff();
});
