define(['knockout', 'bamDataFeed'],
  function(ko, bdf) {


function buildParameters(demozone) {

	var key = "DEMOZONE";
	var value = demozone;
	var paramType = "String";
	return {
		parameters:[
			{
			name: key,
			value: value,
			type: paramType
			}
		]
	};
	
	}

  
function bamController() {

	var raceidUri = "ws://129.152.131.103:9001/bam/composer/Anki/Current_Race/wsdata";
	var dronestatusUri = "ws://129.152.131.103:9001/bam/composer/Anki/Drone_Status/wsdata";
	var speedUri = "ws://129.152.131.103:9001/bam/composer/Anki/Current_Speed/wsdata";
	var avglapspeedUri = "ws://129.152.131.103:9001/bam/composer/Anki/Speed_Avg_per_Lap/wsdata";
	var laptimeUri = "ws://129.152.131.103:9001/bam/composer/Anki/Time_per_Lap/wsdata";
	var offtrackUri = "ws://129.152.131.103:9001/bam/composer/Anki/Offtracks/wsdata";
	var fastestlapUri = "ws://129.152.131.103:9001/bam/composer/Anki/Fastest_Lap_per_Race/wsdata";

	var demozone = "PARIS";

	var self = this;

/* Race id feed */

	self.raceId= ko.observable("Race ?");

	function updateRaceid(id, zone) {
		if (id===null) self.raceId("Race ?");
		else self.raceId("Race " + id + " (" + zone + ")");
	}

	self.raceidFeed = bdf.open(raceidUri, buildParameters(demozone), "race");
	self.raceidFeed.onmessage = function(m) {
		if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				updateRaceid(data.RACEID, data.DEMOZONE);
				});		
			}
		    if (m.dataChangeEntries) {
			m.dataChangeEntries.forEach(function(dce) {
				if (dce.dataChangeType === "DELETE") {
					}
				else {
					updateRaceid(dce.data.RACEID, dce.data.DEMOZONE);
					}
				});		
			}
	};

	self.raceidFeed.onclose = function() {
		updateRaceid(null, null);
	};


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
		else if (status === "GOING") self.droneStatus(100);
		else if (status === "LANDING") self.droneStatus(60);
		else self.droneStatus(100);
	}


	self.droneFeed = bdf.open(dronestatusUri, buildParameters(demozone), "drone");
	self.droneFeed.onmessage = function(m) {
		if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				updateDroneStatus(data.STATUS);
				});		
			}
		    if (m.dataChangeEntries) {
			m.dataChangeEntries.forEach(function(dce) {
				if (dce.dataChangeType === "DELETE") {
					}
				else {
					updateDroneStatus(dce.data.STATUS);
					}
				});		
			}

	};




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

	self.speedFeed = bdf.open(speedUri, buildParameters(demozone), "speed");
	self.speedFeed.onmessage = function(m) {
		if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				updateSpeed(data.CARNAME, data.SPEED);
				self.speed[data.BEAM_ID] = self.speed[data.CARNAME];
				});		
			}
		    if (m.dataChangeEntries) {
			m.dataChangeEntries.forEach(function(dce) {
				if (dce.dataChangeType === "DELETE") {
					if (self.speed[dce.keyPath[0]] ) {
						updateSpeed(dce.keyPath[0], 0);
						self.speed[dce.keyPath[0]] = null;
						}
					}
				else {
					updateSpeed(dce.data.CARNAME, dce.data.SPEED);
					self.speed[dce.keyPath[0]] = self.speed[dce.data.CARNAME];
					}
				});		
			}


	};

function find_in_array(arr, name, value) {
    for (var i = 0, len = arr.length; i<len; i++) {
        if (name in arr[i] && arr[i][name] == value) return arr[i];
    };
    return false;
}




/* Average speed feed */

       
        self.avgspeedlineSeriesValue = ko.observableArray([{name : "Skull", items : []},
		          {name : "Ground Shock", items : []},
		          {name : "Guardian", items : []},
		          {name : "Thermo", items : []}]);
        self.avgspeedlineGroupsValue = ko.observableArray([]);
	self.avgspeedorientationValue = ko.observable('vertical');

	self.avgspeedFeed = bdf.open(avglapspeedUri, buildParameters(demozone), "avgspeed");
	self.avgspeedFeed.onmessage = function(m) {
		 var series = [{name : "Skull", items : []},
                          {name : "Ground Shock", items : []},
                          {name : "Guardian", items : []},
                          {name : "Thermo", items : []}];
		 var groups = [];
		 if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				groups[data.LAP] = "Lap " + data.LAP;
				var l = find_in_array(series, 'name', data.CARNAME);
				l.items[data.LAP] = data.AVGAVGSPEED;
				});		
			}
		    if (m.dataChangeEntries) {
			series = self.avgspeedlineSeriesValue();
			groups = self.avgspeedlineGroupsValue();
			m.dataChangeEntries.forEach(function(dce) {
				if ((dce.dataChangeType === "INSERT")||(dce.dataChangeType === "UPDATE")) {
					groups[dce.data.LAP] = "Lap " + dce.data.LAP;
					var l = find_in_array(series, 'name', dce.data.CARNAME);
					l.items[dce.data.LAP] = dce.data.AVGAVGSPEED;
					}
				else if (dce.dataChangeType === "DELETE"){
					}
				});
			
			}

		//if (groups.length>0) {
				self.avgspeedlineSeriesValue(series);
				self.avgspeedlineGroupsValue(groups);
				//}


	};


/* Lap time feed */
   
        
        self.laptimelineSeriesValue = ko.observableArray([{name : "Skull", items : []},
		          {name : "Ground Shock", items : []},
		          {name : "Guardian", items : []},
		          {name : "Thermo", items : []}]);
        self.laptimelineGroupsValue = ko.observableArray([]);
	self.laptimeorientationValue = ko.observable('vertical');

	self.laptimeFeed = bdf.open(laptimeUri, buildParameters(demozone), "laptime");
	self.laptimeFeed.onmessage = function(m) {
		 var series = [{name : "Skull", items : []},
                          {name : "Ground Shock", items : []},
                          {name : "Guardian", items : []},
                          {name : "Thermo", items : []}];
		 var groups = [];
		 if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				groups[data.LAP] = "Lap " + data.LAP;
				var l = find_in_array(series, 'name', data.CARNAME);
				l.items[data.LAP] = data.AVGAVGLAP_TIME_SEC;
				});		
			}
		    if (m.dataChangeEntries) {
			series = self.laptimelineSeriesValue();
			groups = self.laptimelineGroupsValue();
			m.dataChangeEntries.forEach(function(dce) {
				if ((dce.dataChangeType === "INSERT")||(dce.dataChangeType === "UPDATE")) {
					groups[dce.data.LAP] = "Lap " + dce.data.LAP;
					var l = find_in_array(series, 'name', dce.data.CARNAME);
					l.items[dce.data.LAP] = dce.data.AVGAVGLAP_TIME_SEC;
					}
				else if (dce.dataChangeType === "DELETE") {
					}
				});
			
			}

		//if (groups.length>0) {
				self.laptimelineSeriesValue(series);
				self.laptimelineGroupsValue(groups);
				//}


	};


/* Off tracks feed */
   
        
        self.offtracklineSeriesValue = ko.observableArray( [{name : "Skull", items : [0]},
                          {name : "Ground Shock", items : [0]},
                          {name : "Guardian", items : [0]},
                          {name : "Thermo", items : [0]}]);
        self.offtracklineGroupsValue = ko.observableArray([""]);
	self.offtrackorientationValue = ko.observable('vertical');
	self.offtrackstackValue = ko.observable('off');

	self.offtrackFeed = bdf.open(offtrackUri, buildParameters(demozone), "offtracks");
	self.offtrackFeed.onmessage = function(m) {
		 var series = [{name : "Skull", items : [0]},
                          {name : "Ground Shock", items : [0]},
                          {name : "Guardian", items : [0]},
                          {name : "Thermo", items : [0]}];
		 if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				var l = find_in_array(series, 'name', data.CARNAME);
				l.items[0] = data.COUNTX;
				});		
			}
		    if (m.dataChangeEntries) {
			series = self.offtracklineSeriesValue();
			m.dataChangeEntries.forEach(function(dce) {
				if ( (dce.dataChangeType === "INSERT")||(dce.dataChangeType === "UPDATE") ) {
					var l = find_in_array(series, 'name', dce.data.CARNAME);
					l.items[0] = dce.data.COUNTX;
					}
				else if (dce.dataChangeType === "DELETE") {
					var l = find_in_array(series, 'name', dce.keyPath[0]);
					l.items[0] = 0;
					}
				});
			
			}

		//if (groups.length>0) {
				self.offtracklineSeriesValue(series);;
				//}


	};


/* Fastest lap feed */
   
        
        self.fastestlaplineSeriesValue = ko.observableArray( [{name : "Skull", items : [0]},
                          {name : "Ground Shock", items : [0]},
                          {name : "Guardian", items : [0]},
                          {name : "Thermo", items : [0]}]);
        self.fastestlaplineGroupsValue = ko.observableArray([""]);
	self.fastestlaporientationValue = ko.observable('vertical');
	self.fastestlapstackValue = ko.observable('off');

	self.fastestlapFeed = bdf.open(fastestlapUri, buildParameters(demozone), "fastestlap");
	self.fastestlapFeed.onmessage = function(m) {
		 var series = [{name : "Skull", items : [0]},
                          {name : "Ground Shock", items : [0]},
                          {name : "Guardian", items : [0]},
                          {name : "Thermo", items : [0]}];
		 if (m.snapshot) {
			m.snapshot.data.forEach(function(data) {
				var l = find_in_array(series, 'name', data.CARNAME);
				l.items[0] = data.MINLap_Time_Sec;
				});		
			}
		    if (m.dataChangeEntries) {
			series = self.fastestlaplineSeriesValue();
			m.dataChangeEntries.forEach(function(dce) {
				if ( (dce.dataChangeType === "INSERT")||(dce.dataChangeType === "UPDATE") ) {
					var l = find_in_array(series, 'name', dce.data.CARNAME);
					l.items[0] = dce.data.MINLap_Time_Sec;
					}
				else if (dce.dataChangeType === "DELETE") {
					var l = find_in_array(series, 'name', dce.keyPath[1]);
					l.items[0] = 0;
					}
				});
			
			}

		//if (groups.length>0) {
				self.fastestlaplineSeriesValue(series);;
				//}


	};


     }

     return new bamController();
  }
);
