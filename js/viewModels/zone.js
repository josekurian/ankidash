/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your about ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'viewModels/dashboard', 'ojs/ojselectcombobox'],
 function(oj, ko, $, dash) {

    function ZoneViewModel() {
      var self = this;
      self.startButtonClick = function(data, event){
	dash.initSocket(self.zone());
	oj.Router.rootInstance.go('dashboard');
        return true;
      }
      self.zone = ko.observable();
      self.zoneList = ko.observableArray([]);

   		$.ajax(
    	            {
    	               type: "GET",
    	               url:  "http://infra.wedoteam.io:9997/ords/pdb1/anki/demozone/zone/",
                       crossDomain : true,
		       dataType : "json",
    	               success: function (data) {
			var list = [];

			data.items.forEach(function(z) {
				if (z.active === 'Y') list[list.length] = {value: (z.proxyport - 7700 + 10000), label: z.id };

			});

    	               self.zoneList(list);
		       if (list.length>0) self.zone([list[0].value]);
    	               },
    	               error: function (msg, url, line) {

    	               }
    	           });

    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new ZoneViewModel();
  }
);
