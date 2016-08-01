'use strict';

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    console.log('turnOn LED.');
    $('#led-r').turnOn();
	$('#KY-016').turnOn();

	var max_rgb = 255;
	var abs=function(i){
		if(i >= 0){
			return i; 
		}else{
			return -1*i;
		}
	}
	var mod=function(i, d){
		if(i<d){
			return i;
		}else{
			return i - d;
		}
	}
	var cnt=0;
    setInterval(function(){
    	cnt = mod(cnt + 1, max_rgb * 2);
    	var rgb_show = abs(cnt - max_rgb);
    	$('#KY-016').setRGB([rgb_show,rgb_show,rgb_show]);
    },5);

});

$.end(function () {
    $('#led-r').turnOff();
    $('#KY-016').turnOff();
});
