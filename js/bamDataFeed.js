define(function() {

function bamDataFeed(uri, parameters, id) {

	function debug(message) {
		if (self.id) message = id + " : " +message;
		console.log("bamDataFeed : " + message);
		}
	function sendMessage(ws, message) {
		debug("Sending : " + message);
		ws.send(message);
	}

	var self = this;
	
	self.id = id;
	
	self.ws = null;

	self.onmessage = null;

	self.onclose = null;

	self.uri = uri;

	if (parameters) self.uri += "?containsParams=true";

	function createWS() {
		if (self.ws) {
			if ( (self.ws.readyState === WebSocket.OPEN)||(self.ws.readyState === WebSocket.CONNECTING) ) self.ws.close();
			self.ws = null;
			}
		self.ws = new WebSocket(self.uri);
		self.ws.onopen = function(evt) { };
		self.ws.onclose = function(evt) {
			debug("Connexion closed (" +evt.code + ")");
			if (self.onclose) self.onclose();
			if (evt.code != 1000) {
				debug("Connection dropped, trying to connect again...");
				setTimeout(createWS, 2000);
				}
			};
		self.ws.onerror = function(evt) {
			debug("error : " + evt.message);
			};

		self.ws.onmessage = function(evt) {
		   debug("Data received : " + evt.data);
		   var m = JSON.parse(evt.data);
		 
		   if(m === "sendParams") {
			debug('Asking for parameter String');
			sendMessage(this, JSON.stringify(parameters));
		       }

		    if (m.snapshot) {
			if (self.onmessage) self.onmessage(m);
		    	if (self.ws.readyState === WebSocket.OPEN) sendMessage(this, "startActiveData");		
			}

		    if (m.model) {
			m.snapshot = m.model;
			if (self.onmessage) self.onmessage(m);		
			}


		    if (m.dataChangeEntries) {
			if ( (m.dataChangeEntries.length>0) && (m.dataChangeEntries[0].dataChangeType === 'REFRESH') ) sendMessage(this, "sendModel");
			else if (self.onmessage) self.onmessage(m);
			}
		};
	}

	createWS();

	self.close = function() {
		if (self.ws) {
			self.ws.close();
			self.ws = null;
			}
		};

	}

function factory() {

var self = this;
self.open = function(uri, parameters, id) {
	return new bamDataFeed(uri, parameters, id);
	}
}

return new factory();
}
);

