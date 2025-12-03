jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.declare("ZGT_MM_REZ.model.Formatter");

ZGT_MM_REZ.model.Formatter = {

	fnLeadingZeros: function(value) {
		// if (value !== Number) {
		if (!isNaN(value)) {
			value = +value;
			if (value == 0) {
				return '';
			} else {
				return value;
			}
		} else {
			return value;
		}
	}

};