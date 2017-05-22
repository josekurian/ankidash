define(['ojs/ojcore', 'knockout', 'socketio'],
  function(oj, ko, io) {



function socketioController() {

     var self = this;

     // Media queries for repsonsive layouts
      var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

      // Header
      // Application Name used in Branding Area
      self.appName = ko.observable("Anki Overdrive IoT Showcase");
      // User Info used in Global Navigation area
      self.userLogin = ko.observable("Open");

      self.menuItemSelect = function( event, ui ) {
        var item = ui.item.attr('id');
	if (item === "iot") window.open('https://129.150.71.46/ui');
	if (item === "bi") window.open('https://bi-gse00011668.analytics.us2.oraclecloud.com/analytics');
	if (item === "pcs") window.open('https://process-gse00011668.process.us2.oraclecloud.com/bpm/workspace/faces/worklist.jspx');
    };

      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
      self.footerLinks = ko.observableArray([
        new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
        new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
        new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
        new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
        new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
      ]);


	var alarmSound = new Audio('sounds/alarm.wav');

	function playAlarm() {
		alarmSound.currentTime = 0;
		alarmSound.play();
	}

 	self.connectionStatus = ko.observable(false);


	function find_in_array(arr, name, value) {
	    for (var i = 0, len = arr.length; i<len; i++) {
		if (name in arr[i] && arr[i][name] == value) return arr[i];
	    };
	    return false;
	}

/* Race id feed */

	self.raceId = ko.observable("Race ?");

	var racing = false;

	function updateRaceid(id, zone, status) {
		if (id===null) self.raceId("Race ?");
		else {
			var str = "Race " + id + " (" + zone.toUpperCase() + ")";
			if (status) str += " : " + status.toLowerCase();
			self.raceId(str);
		 }
	}



/* Drone status feed */

	self.droneStatus = ko.observable(0);
	self.droneStatusText = "";

	function droneStatusConverter() {
		this.format = function(val) {
		return self.droneStatusText;
		};
	}


	self.droneStatusConverter = new droneStatusConverter();

	function updateDroneStatus(status) {
		self.droneStatusText = status;
		if (status === "LANDED") self.droneStatus(10);
		else if (status === "DOWNLOADING") self.droneStatus(50);
		else if (status === "GOING") self.droneStatus(80);
		else if (status === "LANDING") self.droneStatus(30);
		else if (status === "TAKING PICTURE") self.droneStatus(100);
		else if (status === "RETURNING") self.droneStatus(70);
		else self.droneStatus(0);
	}
	updateDroneStatus("LANDED");



/* Speed feed */

	self.skullSpeed = ko.observable(0);
	self.groundshockSpeed = ko.observable(0);
	self.guardianSpeed = ko.observable(0);
	self.thermoSpeed = ko.observable(0);

	self.speed = [];
	self.speed['Skull'] = self.skullSpeed;
	self.speed['Ground Shock'] = self.groundshockSpeed;
	self.speed['Guardian'] = self.guardianSpeed;
	self.speed['Thermo'] = self.thermoSpeed;

	function updateSpeed(carName, speed) {
		self.speed[carName](speed);
	}

	function resetSpeed() {
		updateSpeed('Skull', 0);
		updateSpeed('Ground Shock', 0);
		updateSpeed('Guardian', 0);
		updateSpeed('Thermo', 0);
	}




/* Average speed feed */

	var avgspeedlineSeriesDefaultValue = [{name : "Skull", items : []},
		          {name : "Ground Shock", items : []},
		          {name : "Guardian", items : []},
		          {name : "Thermo", items : []}];

        self.avgspeedlineSeriesValue = ko.observableArray(avgspeedlineSeriesDefaultValue);
        self.avgspeedlineGroupsValue = ko.observableArray([]);
	self.avgspeedorientationValue = ko.observable('vertical');


	function updateAverageSpeed(carname, speed, lap) {
		var series = self.avgspeedlineSeriesValue();
		var groups = self.avgspeedlineGroupsValue();
		if (!groups[lap]) groups[lap] = " " + lap;
		var l = find_in_array(series, 'name', carname);
		if (l) {
			l.items[lap] = speed;
			self.avgspeedlineSeriesValue(series);
			self.avgspeedlineGroupsValue(groups);
			}
	}

	function resetAverageSpeed() {
		self.avgspeedlineSeriesValue([{name : "Skull", items : []},
		          {name : "Ground Shock", items : []},
		          {name : "Guardian", items : []},
		          {name : "Thermo", items : []}]);
		self.avgspeedlineGroupsValue([]);
	}


/* Lap time feed */


        self.laptimelineSeriesValue = ko.observableArray([{name : "Skull", items : []},
		          {name : "Ground Shock", items : []},
		          {name : "Guardian", items : []},
		          {name : "Thermo", items : []}]);
        self.laptimelineGroupsValue = ko.observableArray([]);
	self.laptimeorientationValue = ko.observable('vertical');


	function updateLaptime(lap, carname, laptime) {
		var series = self.laptimelineSeriesValue();
		var groups = self.laptimelineGroupsValue();
		if (!groups[lap]) groups[lap] = " " + lap;
		var l = find_in_array(series, 'name', carname);
		if (l) {
			l.items[lap] = laptime / 10000;
			self.laptimelineSeriesValue(series);
			self.laptimelineGroupsValue(groups);
			}
	}

	function resetLaptime() {
		self.laptimelineSeriesValue([{name : "Skull", items : []},
		          {name : "Ground Shock", items : []},
		          {name : "Guardian", items : []},
		          {name : "Thermo", items : []}]);
		self.laptimelineGroupsValue([]);
	}





/* Off tracks feed */

        var offtracklineSeriesDefaultValue = [{name : "Skull", items : []},
                          {name : "Ground Shock", items : []},
                          {name : "Guardian", items : []},
                          {name : "Thermo", items : []}];
        self.offtracklineSeriesValue = ko.observableArray(offtracklineSeriesDefaultValue);
        self.offtracklineGroupsValue = ko.observableArray([""]);
	self.offtrackorientationValue = ko.observable('vertical');
	self.offtrackstackValue = ko.observable('off');

	function updateOfftrack(carname) {
		var series = self.offtracklineSeriesValue();
		var l = find_in_array(series, 'name', carname);
		if (l) {
			if (!l.items[0]) l.items[0] = 0;
			l.items[0] = l.items[0] + 1;
			self.offtracklineSeriesValue(series);
			}
	}

	function resetOfftrack() {
		self.offtracklineSeriesValue([{name : "Skull", items : []},
                          {name : "Ground Shock", items : []},
                          {name : "Guardian", items : []},
                          {name : "Thermo", items : []}]);
		self.offtracklineGroupsValue([""]);
	}




/* Fastest lap feed */


        self.fastestlaplineSeriesValue = ko.observableArray( [{name : "Skull", items : []},
                          {name : "Ground Shock", items : []},
                          {name : "Guardian", items : []},
                          {name : "Thermo", items : []}]);
        self.fastestlaplineGroupsValue = ko.observableArray([""]);
	self.fastestlaporientationValue = ko.observable('vertical');
	self.fastestlapstackValue = ko.observable('off');

	function updateFastestlap(carname, laptime) {
		var series = self.fastestlaplineSeriesValue();
		var l = find_in_array(series, 'name', carname);
		if (l) {
			var laptimeSec = laptime / 10000;
			if ((!l.items[0])||(laptimeSec < l.items[0])) {
				l.items[0] = laptimeSec;
				self.fastestlaplineSeriesValue(series);
				}
			}
		}

	function resetFastestlap() {
		self.fastestlaplineSeriesValue([{name : "Skull", items : []},
                          {name : "Ground Shock", items : []},
                          {name : "Guardian", items : []},
                          {name : "Thermo", items : []}]);
		}

	function resetAll() {
		 updateDroneStatus("LANDED");
		 resetSpeed();
		 resetAverageSpeed();
		 resetLaptime();
		 resetOfftrack();
		 resetFastestlap();
		 racing = false;
	}

	var socket = null;

	self.initSocket = function(port) {
	var path = '/socket.io';
	var uri = "http://new.proxy.digitalpracticespain.com:" + port;
	if (socket) {
		socket.disconnect();
		socket.close();
		socket = null;
		}
	socket = io(uri, {path: path, reconnect: true});
	socket.on('connect', function() {
			self.connectionStatus(true);
			}
	);
	socket.on('disconnect', function() {
			self.connectionStatus(false);
			}
	);
	socket.on('race', function(msg, callback) {
			msg.forEach(function(element) {
				  resetAll();
				  updateRaceid(element.payload.data.raceId, element.payload.data.data_demozone, element.payload.data.raceStatus);
				  if (element.payload.data.raceStatus==='RACING') racing = true;
				  else racing = false;
				});
			}
	);
	socket.on('drone', function(msg, callback) {
			if (!racing) return;
			msg.forEach(function(element) {
				  updateDroneStatus(element.payload.data.status);
				});
			}
	);

	socket.on('speed', function(msg, callback) {
				if (!racing) return;
				msg.forEach(function(element) {
					  updateSpeed(element.payload.data.data_carname, element.payload.data.data_speed);
					  updateAverageSpeed(element.payload.data.data_carname, element.payload.data.data_speed, element.payload.data.data_lap);
					});
				}
		);

	socket.on('offtrack', function(msg, callback) {
				if (!racing) return;
				msg.forEach(function(element) {
					  updateSpeed(element.payload.data.data_carname, 0);
					  updateOfftrack(element.payload.data.data_carname);
					});
				if (msg.length>0) playAlarm();
				}
		);
	socket.on('lap', function(msg, callback) {
				if (!racing) return;
				msg.forEach(function(element) {
					  updateLaptime(element.payload.data.data_lap, element.payload.data.data_carname, element.payload.data.data_laptime);
					  updateFastestlap(element.payload.data.data_carname, element.payload.data.data_laptime);
					});
				}
		);


	}

     }

     return new socketioController();
  }
);
