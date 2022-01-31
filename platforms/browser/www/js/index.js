var _output;
var failed;

function onload() {
	var btnNew = document.getElementById('btnNew');
	var btnBack = document.getElementById('btnBack');
	var text = document.getElementById('text');
	var date = document.getElementById('date');
	var datepicker = document.getElementById('datepicker');
	var time = document.getElementById('time');
	var timepicker = document.getElementById('timepicker');
	var btnSave = document.getElementById('btnSave');
	_output = document.getElementById('textOutput');
	var table = document.getElementById('mindTable');
	var dialogWindow = document.getElementById('dialogWindow');
	var h = document.getElementById('_h3');
	var reminder = [];
	failed = true;
	checkBLE();

	var _date = new Date();
	var day = addZero(_date.getDate());
	var month = addZero(_date.getMonth() + 1);
	var year = _date.getFullYear();
	var today = year + "-" + month + "-" + day;
	datepicker.min = today;
	datepicker.value = "2018-05-08";
	timepicker.value = "12:00";

	btnNew.addEventListener('click', function(){
		if (!failed) {
			btnNew.style.display = 'none';
			table.style.display = 'none';
			btnBack.style.display = 'inline';
			text.style.display = 'inline';
			date.style.display = 'inline';
			time.style.display = 'inline';
			btnSave.style.display = 'inline';
			btnTest.style.display = 'none';
			_output.style.display = 'none';
			dialogWindow.style.display = 'none';
		}
		else {
			_output.style.display = 'inline';
			_output.innerHTML = "Disconnected.";
		}
	});

	btnBack.addEventListener('click', function(){
		getBack(btnNew, btnBack, date, time, text, btnSave, btnTest, failed, _output, mindTable, dialogWindow);
	});

	var dt;
	var tm;
	var txt;
	btnSave.addEventListener('click', function(){
		_output.style.display = 'none';
		dt = datepicker.value;
		tm = timepicker.value;
		txt = text.value.toString();
		if (txt.length == 0) {
			_output.innerHTML = "Please set a name for your Reminder.";
			_output.style.display = 'inline';
			_output.style.color = 'red';
		}
		else {
			reminder.push({date: dt, time: tm, text: txt});
			list(dt, tm, txt, mindTable, reminder.length);
			getBack(btnNew, btnBack, date, time, text, btnSave, btnTest, failed, _output, mindTable, dialogWindow);
		}
	});

	var btnTest = document.getElementById('btnTest');
	btnTest.addEventListener('click', function(){
		if (!failed) {
			var t = document.createTextNode('Reminder Test');
			var h = document.getElementById('_h3');
			showReminder('Reminder Test', dialogWindow, h, t);
		}
	});

	var btnClose = document.getElementById('btnClose');
	btnClose.addEventListener('click', function() {
		dialogWindow.style.display = 'none';
		h.removeChild(h.childNodes[0]);
	});

	var hour;
	var minutes;
	var now;
	setInterval(function(){
		_date = new Date();
		hour = addZero(_date.getHours());
		minutes = addZero(_date.getMinutes());
		now = hour + ":" + minutes;
		for (var i = 0; i < reminder.length; i++) {
				if (today == reminder[i].date && now == reminder[i].time) {
					var t = document.createTextNode(reminder[i].text);
					if (!failed) {
						showReminder(reminder[i].text, dialogWindow, h, t);
						table.deleteRow(i);
						var rem = [];
						var length = 0;
						for (let j = 0; j < reminder.length; j++) {
							if (j != i) {
								rem[length] = reminder[j];
								length += 1;
							}
						}
						reminder = [];
						reminder = rem;
					}
				}
			}
	}, 5000);
};

function addZero(num) {
	if (num < 10) {
		num = "0" + num;
	}
	return num;
};

function getBack(btnNew, btnBack, date, time, text, btnSave, btnTest, failed, _output, table, dialogWindow) {
	btnNew.style.display = 'inline';
	btnBack.style.display = 'none';
	text.style.display = 'none';
	date.style.display = 'none';
	time.style.display = 'none';
	btnSave.style.display = 'none';
	btnTest.style.display = 'inline';
	if (failed) {
		_output.style.display = 'inline';
	}
	else {
		_output.style.display = 'none';
	}
	dialogWindow.style.display = 'none';
	table.style.display = 'inline';
};

function list(date, time, text, table, length) {
	var row;
	var cell1;
	var cell2;
	var cell3;
	row = table.insertRow(length - 1);
	cell1 = row.insertCell(0);
	cell2 = row.insertCell(1);
	cell3 = row.insertCell(2);
	cell1.innerHTML = date;
	cell2.innerHTML = time;
	cell3.innerHTML = text;
};

function showReminder(text, dialogWindow, h, t) {
	h.appendChild(t);
	dialogWindow.appendChild(h);
	dialogWindow.style.display = 'block';
	vibrationOn();
};






//BLE ------- Service/Characteristics for TECO Vibration Wearable.
var VIB_SERVICE	       	= "713D0000-503E-4C75-BA94-3148F18D941E";
var VIB_CHARACTERISTIC	= "713D0003-503E-4C75-BA94-3148F18D941E";

var scanTimeout;
var cycleInterval;

var connectedDevice;
var data = new Uint8Array(4);

function checkBLE() {
	ble.isEnabled(bleEnabled, bleDisabled);
};

function bleDisabled() {
	failed = true;
	_output.style.display = 'inline';
	_output.style.color = '#f9a302';
	_output.innerHTML = "Please enable Bluetooth.";
};

function bleEnabled() {
	failed = false;
	ble.scan([], 100, function(device) {
		//if (device.name.toUpperCase().includes("TECO WEARABLE")) {							//Wearable 6
		if (device.name == "TECO Wearable 6") {
			ble.stopScan(stopSuccess, stopFailure);
			clearTimeout(scanTimeout);														//
			ble.connect(device.id, connectSuccess, connectFailure);
		} else {
			_output.style.display = 'inline';
			_output.style.color = 'red';
			_output.innerHTML = "No TECO Wearable found.";
			failed = true;
		}
	}, stopBLEScan);
	// If device was not found after 100 seconds, stop scan.
	scanTimeout = setTimeout(stopBLEScan, 100000);
};

function stopSuccess(){}

function stopFailure(){}

function stopBLEScan(){
	_output.style.display = 'inline';
	_output.style.color = 'red';
	_output.innerHTML = "No devices found.";
	failed = true;
};

function connectFailure(peripheral) {
	_output.style.display = 'inline';
	_output.style.color = 'red';
	_output.innerHTML = "Disconnected.";
	failed = true;
};

function connectSuccess(device) {
	connectedDevice = device;
	console.log(JSON.stringify(device));
	_output.innerHTML = "Connected.";
	_output.style.color = 'green';
	_output.style.display = 'inline';
	failed = false;
};

var timer = 0;

function vibrationOn() {
		data[0] = 0xff;
		data[1] = 0xff;
		data[2] = 0xff;
		data[3] = 0xff;
		ble.writeWithoutResponse(connectedDevice.id, VIB_SERVICE, VIB_CHARACTERISTIC, data.buffer, writeDone, writeFailure);
		setTimeout(function() {
			data[0] = 0x00;
			data[1] = 0x00;
			data[2] = 0x00;
			data[3] = 0x00;
			ble.writeWithoutResponse(connectedDevice.id, VIB_SERVICE, VIB_CHARACTERISTIC, data.buffer, writeDone, writeFailure);
		}, 1000);
};

function writeDone() {};

function writeFailure() {};