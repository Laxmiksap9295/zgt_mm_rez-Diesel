sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ZGT_MM_REZ/model/models",
	"ZGT_MM_REZ/model/Formatter"
], function(UIComponent, Device, models, Formatter) {
	"use strict";

	return UIComponent.extend("ZGT_MM_REZ.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});