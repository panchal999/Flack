$(document).ready(function() {

	var socket = io.connect(location.protocol+'//'+document.domain+':'+location.port);

	$("#channelnew").on('click', 'a', function(){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		var dataChannel=$(this).attr("data-channel");
		console.log('From JQuery'+dataChannel)
		socket.emit('changed channel',{'channel_name':dataChannel});

	});

});

