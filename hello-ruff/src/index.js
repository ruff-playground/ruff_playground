'use strict';

$.ready(function (error) {
	if (error) {
        console.log(error);
        return;
    }

    // Turn on `#led-r` when `#button` is pushed.
    $('#button').on('push', function() {
        console.log('Button pushed.');
        $('#led-r').turnOn();
    });

    // Turn off `#led-r` when `#button` is released.
    $('#button').on('release', function() {
        console.log('Button released.');
        $('#led-r').turnOff();
    });
});

$.end(function () {
    $('#led-r').turnOff();
});
