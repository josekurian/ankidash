/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojknockout', 'ojs/ojrouter'],
  function(oj, ko) {
     function ControllerViewModel() {
       var self = this;

      self.router = oj.Router.rootInstance;
     }

     return new ControllerViewModel();
  }
);
