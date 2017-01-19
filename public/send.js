var start = 1;

function sendData() {
	if (start) {
		start = 0;
		setTimeout(sendData, 5000);
	} else {
		postMessage('send');
		setTimeout(sendData, 120000);
	}
}
sendData();