'use strict';
var net = require('net');

$.ready(function (error) {
	var lcd = $("#LCD1602-02");
	var car = $("#car_base");
	var button = $("#CK002");
	var port = 9999;
	var msgs_queue = []

	//
	var cmdCount = 0;
    var noCmdPassedTime = 0;
    var stopDelay = 1000;
    var autoStopTimerInterval = 100;

    var msgProcessorTimerInterval = 50;
    //
    var msgProcessor = function() {
    	if(msgs_queue.length === 0) {
    		return;
    	}
    	var msgStr = msgs_queue.pop();
		if(msgStr.length <= 0){
			return;
		}
		console.log(msgStr)
    	var msg = {};
    	try{
    		msg = JSON.parse(msgStr);
    	}catch(e){
    		console.log('message is not a valid JSON');
    		return;
    	}
    	switch(msg.type){
    		case "KEY_EVENT":
    			noCmdInterval = 0;
    			onKeyEvent(msg);
    		break;
    		case "SPEED_CHANGE":
    			noCmdInterval = 0;
    			onSpeepChangeEvent(msg);
    		break;
    		case "BASE_RATE_CHANGE":
    			noCmdInterval = 0;
    			onBaseRateChangeEvent(msg);
    		break;
    		default:
    		break;
    	}
    }
    setInterval(msgProcessor, msgProcessorTimerInterval)


	var lastKey = 0;
    if (error) {
        console.log(error);
        return;
    }

    console.log('board started');


    var autoStop = function(){
		noCmdPassedTime = noCmdPassedTime + autoStopTimerInterval	;
		if(noCmdPassedTime > stopDelay){
			car.stop();
		}	
    }



    setInterval(autoStop, autoStopTimerInterval)

    var lcdShow = function(line1, line2){

		lcd.clear();
		lcd.setCursor(0, 0);
		lcd.print(line1);
		if(line2){
			lcd.setCursor(0, 1);
			lcd.print(line2);
		}
    }



	var onKeyEvent = function(msg) {
		if(msg.body.eventCode === 0){
			car.stop();
			lcdShow("Waiting ....");
			lastKey = 0;
			return;
		}
		if(msg.body.keyCode === lastKey){
			return;
		}
		lastKey = msg.body.keyCode;
		switch(msg.body.keyCode){
			case 10: 
				car.stop();
				lcdShow("Waiting ....");
			break;
			case 38: 
				car.moveFront(); 
				lcdShow("Moving Front....");
				break;
			case 40: 
				car.moveBack(); 
				lcdShow("Moving Back....");
			break;
			case 37: 
				car.turnLeft(); 
				lcdShow("Turning Left....");
			break;
			case 39:
			 	car.turnRight(); 
				lcdShow("Turning Right....");
			 break;
		}
	}

	var onSpeepChangeEvent = function (msg) {
		lcdShow("Speed: (" + msg.body.x + "," + msg.body.y + ")");
		car.setSpeed(msg.body.x, msg.body.y);
	}

	var onBaseRateChangeEvent = function (msg) {
		car.setBaseRate(msg.body.baseRate);
	}


	var connect = function(){
		var client = net.connect({port:port,host:'10.17.6.27'},function(){
			console.log('connect to server!');
			client.write('Hello world! from board!\r\n');
	    });

	    client.on('data', function(data) {
	    	var trimed = data.toString().trim().replace('\r\n','\n');
	    	var msgs = trimed.split('\n');
	    	for(var i = 0 ; i < msgs.length; i++){
	    		var msgStr = msgs[i];
	    		msgs_queue.unshift(msgStr)

		    	
	    	}
	    	


	    	
		});
		client.on('end', function() {
		  	console.log('disconnected from server');
		  	lcdShow("Lost connect!");
		  	car.stop();
		});

	}
	connect();
    

    $('#led-r').turnOn();
});

$.end(function () {

    $('#led-r').turnOff();
    $('#car_base').stop();
});
