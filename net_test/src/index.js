'use strict';
var net = require('net');

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    var client=net.connect({port:5556,host:"10.17.6.27"},function(){
		console.log("connect to server!");
		client.write("Hello world!\r\n");
    });
    client.on('data', function(data) {
		console.log(data.toString());
		client.end();
	});
	client.on('end', function() {
	  	console.log('disconnected from server');
	});

    $('#led-r').turnOn();
});

$.end(function () {
    $('#led-r').turnOff();
});
