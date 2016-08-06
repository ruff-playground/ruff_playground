'use strict';
var net = require('net');

$.ready(function (error) {
	var lastKey = 0;
    if (error) {
        console.log(error);
        return;
    }
    console.log('board started');
    var client=net.connect({port:5556,host:'10.17.6.27'},function(){
		console.log('connect to server!');
		client.write('Hello world! from board!\r\n');
    });

    client.on('data', function(data) {
    	console.log(data.toString());
    	var trimed = data.toString().trim();
    	var msg = {};
    	try{
    		msg = JSON.parse(data.toString());
    	}catch(e){
    		console.log('message is not a valid JSON');
    	}
    	
    	if (msg.type !== 'KEY_EVENT'){
    		return;
    	}
		if(msg.body.eventCode === 0){
			$('#car_base').stop();
			lastKey = 0;
			return;
		}
		if(msg.body.keyCode === lastKey){
			return;
		}

		lastKey = msg.body.keyCode;
		switch(msg.body.keyCode){
			case 38: $('#car_base').moveFront(); break;
			case 40: $('#car_base').moveBack(); break;
			case 37: $('#car_base').turnLeft(); break;
			case 39: $('#car_base').turnRight(); break;
		}

	});

	client.on('end', function() {
	  	console.log('disconnected from server');
	  	$('#car_base').stop();
	});


    $('#led-r').turnOn();
});

$.end(function () {
    $('#led-r').turnOff();
    $('#car_base').stop();
});
