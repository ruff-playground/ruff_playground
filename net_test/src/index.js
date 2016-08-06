'use strict';
var net = require('net');

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    console.log("board started");
    var client=net.connect({port:5556,host:"10.17.6.27"},function(){
		console.log("connect to server!");
		client.write("Hello world!\r\n");
    });

    client.on('data', function(data) {
		console.log(data.toString());
	});

	client.on('end', function() {
	  	console.log('disconnected from server');
	});

    // 在 `#button` 按下时点亮 `#led-r`.
    $('#CK002').on('push', function() {
        console.log('Button pushed.');
        client.write("Hello world!\r\n");
        $('#led-r').turnOn();
    });

    // 在 `#button` 释放时熄灭 `#led-r`.
    $('#CK002').on('release', function() {
        console.log('Button released.');
        client.write("Goodbye world!\r\n");
        $('#led-r').turnOff();
    });

    $('#led-r').turnOn();
});

$.end(function () {
    $('#led-r').turnOff();
});
