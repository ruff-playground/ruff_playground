'use strict';
var net = require('net');

$.ready(function (error) {
	var lcd = $("#LCD1602-02");
	var car = $("#car_base");
	var button = $("#CK002");
	var port = 8899;

	var lastKey = 0;
    if (error) {
        console.log(error);
        return;
    }

    console.log('board started');
    var cmdCount = 0;
    var noCmdInterval = 0;
    var stopInterval = 1000;
    var timerInteval = 100;
    var autoStop = function(){
		noCmdInterval = noCmdInterval + timerInteval;
		if(noCmdInterval > stopInterval){
			car.stop();
		}	
    }
    setInterval(autoStop, timerInteval)

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
	    	console.log(trimed);
	    	var msgs = trimed.split('\n');
	    	for(var i = 0 ; i < msgs.length; i++){
	    		var msgStr = msgs[i];
	    		if(msgStr.length<=0){
	    			continue;
	    		}
		    	var msg = {};
		    	try{
		    		msg = JSON.parse(msgStr);
		    	}catch(e){
		    		console.log('message is not a valid JSON');
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
