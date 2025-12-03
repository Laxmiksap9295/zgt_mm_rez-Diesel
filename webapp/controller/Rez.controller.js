jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ndc.BarcodeScanner");
var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"ZGT_MM_REZ/model/Formatter",
	"sap/m/BusyDialog",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
], function (Controller, JSONModel, FilterOperator, Filter, Formatter, BusyDialog, MessageToast, MessageBox) {
	"use strict";
	var that, oView, oModel, oi18n, busyDialog, busyDialogSave, vWbId;
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn;
	return Controller.extend("ZGT_MM_REZ.controller.Rez", {
		Formatter: Formatter, //Added by Avinash
		/*<!--=============================================================================-->*/
		/*<!--				Author		: Avinash           			                   -->*/
		/*<!--				Desciption  : Diesel Consumption Int & Ext Controller          -->*/
		/*<!--				Created On  : May 2021					                       -->*/
		/*<!--=============================================================================-->*/

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZGT_MM_REZ.view.Rez
		 */
		onInit: function () {
			var vPathImage = jQuery.sap.getModulePath("ZGT_MM_REZ");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/olam.png");
			this.getView().byId('id_setting').setSrc(vPathImage + "/Images/setting.png");
			this.getView().byId('id_Internal').setSrc(vPathImage + "/Images/Internal.png");
			this.getView().byId('id_External').setSrc(vPathImage + "/Images/External.png");
			this.oGRourter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oGRourter.attachRoutePatternMatched(this.fnHandler, this);

			//added by srinivas on 15/09/2025

			oThat = this;
			oThat.Images = [];
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			  var oLocalModel = new sap.ui.model.json.JSONModel({
                   showFuelFields: false, // hide or show fields based on fuelissue field
				   hideFuelFields : true
                });
             oThat.getView().setModel(oLocalModel, "localModel");

			//ended
		},

		fnHandler: function (oEvent) {
			var oPage = oEvent.getParameter("name");
			if (oPage === "Rez") {
				that = this;
				oView = this.getView();
				this.Key = "";
				oi18n = oView.getModel("i18n");
				busyDialog = new sap.m.BusyDialog({
					text: oi18n.getProperty("PlWaitDataLoad")
				});
				busyDialogSave = new sap.m.BusyDialog({
					text: oi18n.getProperty("PlWaitDataSave")
				});
				oView.byId("id_Plant").setText("");
				// this.fnClear();
				this.fnLoadWerks();
				this.fnLoadMatnr();
			}
		},

		fnExternal: function (oEvent) {
			this.getView().byId('id_EmptySltf').removeStyleClass('cl_BgSelection');
			this.getView().byId('id_EmptySlff').addStyleClass('cl_BgSelection');
			// this.getView().byId('id_Type').setText("Internal Consumption");
			this.getView().byId('id_pExternal').setVisible(true);
			this.getView().byId('id_pInternal').setVisible(false);
			var self = this;
			if (this.Werks) {
				this.Key = oEvent.getSource().getText();
				//  added for diesel issue by srinivas on 12/09/2025
				if (this.Key === "External Vehicle") {
					this.Key = "E"
				}
				// ended by srinivas
				if (this.Key == "E") {
					this.Key = "EXT";
				}
				self.onSetPostModel();
				self._onRouteMatched(oEvent);
			} else {
				self._onRouteMatched(oEvent);
				sap.m.MessageToast.show(oi18n.getProperty('PlChoosePlant'));
			}
			// this.getView().byId('id_plWeighment').setVisible(true);
		},
		fnInternal: function (oEvent) {
			this.getView().byId('id_EmptySlff').removeStyleClass('cl_BgSelection');
			this.getView().byId('id_EmptySltf').addStyleClass('cl_BgSelection');
			this.getView().byId('id_pExternal').setVisible(false);
			this.getView().byId('id_pInternal').setVisible(true);
			var self = this;
			if (this.Werks) {
				this.Key = oEvent.getSource().getText();
				//  added for diesel issue by srinivas on 12/09/2025
				if (this.Key === "Internal Vehicle") {
					this.Key = "I"
				}
				// ended by srinivas
				if (this.Key == "I") {
					this.Key = "INT";
				}
				this.getView().byId("id_compVehicleRadioBtn").setSelected(false);
				this.getView().byId("id_NoncompVehicleRadioBtn").setSelected(false);
				//this.getView().byId("id_reportsBtn").setVisible(true);
				self.onSetPostModel();
				self._onRouteMatched(oEvent);
			} else {
				self._onRouteMatched(oEvent);
				sap.m.MessageToast.show(oi18n.getProperty('PlChoosePlant'));
			}

			// this.getView().byId('id_Type').setText("External Consumption");
		},

		_onRouteMatched: function (oEvent) {

			that.oDisplayEXT = {

				"WBID": false,
				"WBID_REQ": false,
				"WBID_DISP": false,
				"WBID_NAME": "",
				"WBID_HELP": false,

				"MATNR": false,
				"MATNR_REQ": false,
				"MATNR_DISP": false,
				"MATNR_NAME": "",
				"MATNR_HELP": false,

				"VEHNO": false,
				"VEHNO_REQ": false,
				"VEHNO_DISP": false,
				"VEHNO_NAME": "",
				"VEHNO_HELP": false,

				"LIFNR": false,
				"LIFNR_REQ": false,
				"LIFNR_DISP": false,
				"LIFNR_NAME": "",
				"LIFNR_HELP": false,

				"CNNUM": false,
				"CNNUM_REQ": false,
				"CNNUM_DISP": false,
				"CNNUM_NAME": "",
				"CNNUM_HELP": false,

				"CHALLAN": false,
				"CHALLAN_REQ": false,
				"CHALLAN_DISP": false,
				"CHALLAN_NAME": "",
				"CHALLAN_HELP": false,

				"VEHTYP": false,
				"VEHTYP_REQ": false,
				"VEHTYP_DISP": false,
				"VEHTYP_NAME": "",
				"VEHTYP_HELP": false,

				"DRIVER_ID": false,
				"DRIVER_ID_REQ": false,
				"DRIVER_ID_DISP": false,
				"DRIVER_ID_NAME": "",
				"DRIVER_ID_HELP": false,

				"DRIVER_MOB": false,
				"DRIVER_MOB_REQ": false,
				"DRIVER_MOB_DISP": false,
				"DRIVER_MOB_NAME": "",
				"DRIVER_MOB_HELP": false,

				"EBELN": false,
				"EBELN_REQ": false,
				"EBELN_DISP": false,
				"EBELN_NAME": "",
				"EBELN_HELP": false,

				"VBELN": false,
				"VBELN_REQ": false,
				"VBELN_DISP": false,
				"VBELN_NAME": "",
				"VBELN_HELP": false,

				"ERFMG": false,
				"ERFMG_REQ": false,
				"ERFMG_DISP": false,
				"ERFMG_NAME": "",
				"ERFMG_HELP": false,

				"ERFME": false,
				"ERFME_REQ": false,
				"ERFME_DISP": false,
				"ERFME_NAME": "",
				"ERFME_HELP": false,

				"DNAME": false,
				"DNAME_REQ": false,
				"DNAME_DISP": false,
				"DNAME_NAME": "",
				"DNAME_HELP": false,
				// Added by Avinash for IVC Rubber
				// added by srinivas on 15/09/2025
				"LGORT": false,
				"LGORT_REQ": false,
				"LGORT_DISP": false,
				"LGORT_NAME": "",
				"LGORT_HELP": false,
				// ended by srinivas
				
				//Added by Laxmikanth
				"VEHOWN": false,
				"VEHOWN_REQ": false,
				"VEHOWN_DISP": false,
				"VEHOWN_NAME": "",
				"VEHOWN_HELP": false,
				
				"NCOMVEH": false,
				"NCOMVEH_REQ": false,
				"NCOMVEH_DISP": false,
				"NCOMVEH_NAME": "",
				"NCOMVEH_HELP": false,

				"COMVEH": false,
				"COMVEH_REQ": false,
				"COMVEH_DISP": false,
				"COMVEH_NAME": "",
				"COMVEH_HELP": false,

				"SAKNR": false,  
				"SAKNR_REQ": false,
				"SAKNR_DISP": false,
				"SAKNR_NAME": "",
				"SAKNR_HELP": false,

				"UMSKZ": false,
				"UMSKZ_REQ": false,
				"UMSKZ_DISP": false,
				"UMSKZ_NAME": "",
				"UMSKZ_HELP": false,

				"NETPR": false,
				"NETPR_REQ": false,
				"NETPR_DISP": false,
				"NETPR_NAME": "",
				"NETPR_HELP": false,

				"KOSTL": false,
				"KOSTL_REQ": false,
				"KOSTL_DISP": false,
				"KOSTL_NAME": "",
				"KOSTL_HELP": false

			};
			that.getView().setModel(new JSONModel(that.oDisplayEXT), "JMExt");
			// var oJSONModel = new sap.ui.model.json.JSONModel();
			// oJSONModel.setData(that.oDisplayEXT);
			// that.getView().setModel(oJSONModel, "JMExt");

			that.oDisplayIN = {
				"WBID": false,
				"WBID_REQ": false,
				"WBID_DISP": false,
				"WBID_NAME": "",
				"WBID_HELP": false,

				"ITEM": false,
				"ITEM_REQ": false,
				"ITEM_DISP": false,
				"ITEM_NAME": "",
				"ITEM_HELP": false,

				"ERFMG": false,
				"ERFMG_REQ": false,
				"ERFMG_DISP": false,
				"ERFMG_NAME": "",
				"ERFMG_HELP": false,

				"ERFME": false,
				"ERFME_REQ": false,
				"ERFME_DISP": false,
				"ERFME_NAME": "",
				"ERFME_HELP": false,

				"MATNR": false,
				"MATNR_REQ": false,
				"MATNR_DISP": false,
				"MATNR_NAME": "",
				"MATNR_HELP": false,

				"CHALLAN": false,
				"CHALLAN_REQ": false,
				"CHALLAN_DISP": false,
				"CHALLAN_NAME": "",
				"CHALLAN_HELP": false,

				"BRGEW": false,
				"BRGEW_REQ": false,
				"BRGEW_DISP": false,
				"BRGEW_NAME": "",
				"BRGEW_HELP": false,

				"ERDAT": false,
				"ERDAT_REQ": false,
				"ERDAT_DISP": false,
				"ERDAT_NAME": "",
				"ERDAT_HELP": false,

				"TRWGT": false,
				"TRWGT_REQ": false,
				"TRWGT_DISP": false,
				"TRWGT_NAME": "",
				"TRWGT_HELP": false,

				"ERTIM": false,
				"ERTIM_REQ": false,
				"ERTIM_DISP": false,
				"ERTIM_NAME": "",
				"ERTIM_HELP": false,

				// Added by Avinash for IVC Rubber
				"BNNUM": false,
				"BNNUM_REQ": false,
				"BNNUM_DISP": false,
				"BNNUM_NAME": "",
				"BNNUM_HELP": false,

				"CNNUM": false,
				"CNNUM_REQ": false,
				"CNNUM_DISP": false,
				"CNNUM_NAME": "",
				"CNNUM_HELP": false,

				"BMCNU": false,
				"BMCNU_REQ": false,
				"BMCNU_DISP": false,
				"BMCNU_NAME": "",
				"BMCNU_HELP": false,

				"DNAME": false,
				"DNAME_REQ": false,
				"DNAME_DISP": false,
				"DNAME_NAME": "",
				"DNAME_HELP": false,

				"DRIVER_ID": false,
				"DRIVER_ID_REQ": false,
				"DRIVER_ID_DISP": false,
				"DRIVER_ID_NAME": "",
				"DRIVER_ID_HELP": false,

				"DRIVER_MOB": false,
				"DRIVER_MOB_REQ": false,
				"DRIVER_MOB_DISP": false,
				"DRIVER_MOB_NAME": "",
				"DRIVER_MOB_HELP": false,

				"FREFO": false,
				"FREFO_REQ": false,
				"FREFO_DISP": false,
				"FREFO_NAME": "",
				"FREFO_HELP": false,

				"LIFNR": false,
				"LIFNR_REQ": false,
				"LIFNR_DISP": false,
				"LIFNR_NAME": "",
				"LIFNR_HELP": false,

				"OTNUM": false,
				"OTNUM_REQ": false,
				"OTNUM_DISP": false,
				"OTNUM_NAME": "",
				"OTNUM_HELP": false,

				"SHIPL": false,
				"SHIPL_REQ": false,
				"SHIPL_DISP": false,
				"SHIPL_NAME": "",
				"SHIPL_HELP": false,

				"VEHTYP": false,
				"VEHTYP_REQ": false,
				"VEHTYP_DISP": false,
				"VEHTYP_NAME": "",
				"VEHTYP_HELP": false,

				"VEHNO": false,
				"VEHNO_REQ": false,
				"VEHNO_DISP": false,
				"VEHNO_NAME": "",
				"VEHNO_HELP": false,

				// added by srinivas on 15/09/2025
				"LGORT": false,
				"LGORT_REQ": false,
				"LGORT_DISP": false,
				"LGORT_NAME": "",
				"LGORT_HELP": false,
				// ended by srinivas

				//Added by Laxmikanth
				"VEHOWN": false,
				"VEHOWN_REQ": false,
				"VEHOWN_DISP": false,
				"VEHOWN_NAME": "",
				"VEHOWN_HELP": false,

				"NCOMVEH": false,
				"NCOMVEH_REQ": false,
				"NCOMVEH_DISP": false,
				"NCOMVEH_NAME": "",
				"NCOMVEH_HELP": false,

				"COMVEH": false,
				"COMVEH_REQ": false,
				"COMVEH_DISP": false,
				"COMVEH_NAME": "",
				"COMVEH_HELP": false,
				
				"SAKNR": false,
				"SAKNR_REQ": false,
				"SAKNR_DISP": false,
				"SAKNR_NAME": "",
				"SAKNR_HELP": false,
				
				"UMSKZ": false,
				"UMSKZ_REQ": false,
				"UMSKZ_DISP": false,
				"UMSKZ_NAME": "",
				"UMSKZ_HELP": false,

				"NETPR": false,
				"NETPR_REQ": false,
				"NETPR_DISP": false,
				"NETPR_NAME": "",
				"NETPR_HELP": false,

				"KOSTL": false,
				"KOSTL_REQ": false,
				"KOSTL_DISP": false,
				"KOSTL_NAME": "",
				"KOSTL_HELP": false


			};
			// var oJSONModel = new sap.ui.model.json.JSONModel();
			// oJSONModel.setData(that.oDisplayINT);
			// that.getView().setModel(oJSONModel, "JMInt");
			that.getView().setModel(new JSONModel(that.oDisplayIN), "JMInt");
			if (this.Werks) {
				busyDialog.open();

				this.getView().getModel().read("/GetFieldInSet", {
					filters: [new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.Werks),
						new sap.ui.model.Filter("Prtyp", sap.ui.model.FilterOperator.EQ, this.Key)
					],
					urlParameters: {
						$expand: "GetFieldOutNav,GetFieldReturnNav"
					},
					async: true,
					success: function (oData, Iresponse) {
						var i, vTemp;
						oThat.Images = [];// added by srinivas on 25/09/2025
						if (oData.results[0].GetFieldReturnNav.results.length > 0) {
							sap.m.MessageBox.error(oData.results[0].GetFieldReturnNav.results[0].Message);
						} else {
							that.Issuer = oData.results[0].Issuer;
							that.Requester = oData.results[0].Requester;
							that.getOwnerComponent().getModel("SelectedVehicleModel").setData(oData.results[0])
							//added by srinivas on 25/09/2025
							if(oData.results[0].FuelIssue ==="X"){
								that.FuelIssue = oData.results[0].FuelIssue;
								// that.getView().byId("idCaptureImageExt").setVisible(true);
								// that.getView().byId("idCaptureImageInt").setVisible(true);
								 that.getView().getModel("localModel").setProperty("/showFuelFields", true);
								  that.getView().getModel("localModel").setProperty("/hideFuelFields", false);
								if(oData.results[0].Issuer === 'X'){
									that.getView().byId("id_userAuthText").setText("User Role:" +" "+"Issuer");
									that.getView().byId("id_userAuthText1").setText("User Role:" +" "+"Issuer");
								}else{
									that.getView().byId("id_userAuthText").setText("User Role:" +" "+"Requester");
									that.getView().byId("id_userAuthText1").setText("User Role:" +" "+"Requester");
								}
							}else{
								that.FuelIssue = oData.results.FuelIssue;
								 that.getView().getModel("localModel").setProperty("/showFuelFields", false);
								   that.getView().getModel("localModel").setProperty("/hideFuelFields", true);
								   if(oData.results[0].Issuer === 'X'){
									that.getView().byId("id_userAuthText").setText("");
									that.getView().byId("id_userAuthText1").setText("");
								}else{
									that.getView().byId("id_userAuthText").setText("");
									that.getView().byId("id_userAuthText1").setText("");
								}
							}
							//ended

							if (that.Key === "EXT") {
								for (i = 0; i < oData.results[0].GetFieldOutNav.results.length; i++) {
									vTemp = oData.results[0].GetFieldOutNav.results[i].Fld;
									that.oDisplayEXT[vTemp] = true;
									if (oData.results[0].GetFieldOutNav.results[i].Req === "X") {
										that.oDisplayEXT[vTemp + "_REQ"] = true;
									} else {
										that.oDisplayEXT[vTemp + "_REQ"] = false;
									}
									if (oData.results[0].GetFieldOutNav.results[i].Disp === "X") {
										that.oDisplayEXT[vTemp + "_DISP"] = false;
									} else {
										that.oDisplayEXT[vTemp + "_DISP"] = true;
									}
									if (oData.results[0].GetFieldOutNav.results[i].HelpType !== "") {
										that.oDisplayEXT[vTemp + "_HELP"] = true;
									} else {
										that.oDisplayEXT[vTemp + "_HELP"] = false;
									}
									if (oData.results[0].GetFieldOutNav.results[i].Cname !== "") {
										that.oDisplayEXT[vTemp + "_NAME"] = oData.results[0].GetFieldOutNav.results[i].Cname;
									} else {
										that.oDisplayEXT[vTemp + "_NAME"] = oData.results[0].GetFieldOutNav.results[i].Fname;
									}
								}
								if (oData.results[0].Requester === 'X' && oData.results[0].FuelIssue === "X") {
									that.getView().byId("id_reportsBtn").setVisible(true); //reports Button
								} else {
									that.getView().byId("id_reportsBtn").setVisible(false); //reports Button
								}
								if (oData.results[0].Issuer === 'X') {
									//that.getView().byId("id_reportsBtn").setVisible(false); //reports Button
									that.getView().getModel("localModel").setProperty("/showFuelFields", true);
									that.getView().getModel("JMExt").getData().VEHNO_HELP = false;
									that.getView().getModel("JMExt").getData().DNAME_DISP = false;
									that.getView().getModel("JMExt").getData().DNAME_HELP = false;
									that.getView().getModel("JMExt").getData().VEHTYP_DISP = false;
									that.getView().getModel("JMExt").getData().MATNR_DISP = false;
									that.getView().getModel("JMExt").getData().MATNR_HELP = false;
									that.getView().getModel("JMExt").getData().LGORT_DISP = true;
									that.getView().getModel("JMExt").getData().LGORT_HELP = true;

									that.getView().getModel("JMExt").getData().VEHNO_DISP = false;
									that.getView().getModel("JMExt").getData().VEHNO_HELP = false;
									that.getView().getModel("JMExt").getData().UMSKZ_DISP = false;
									that.getView().getModel("JMExt").getData().UMSKZ_HELP = false;
									that.getView().getModel("JMExt").getData().UMSKZ = false;
									that.getView().getModel("JMExt").getData().NETPR_DISP = false;
									that.getView().getModel("JMExt").getData().NETPR_HELP = false;
									that.getView().getModel("JMExt").getData().NETPR = false;
									that.getView().getModel("JMExt").getData().ERFMG_DISP = true;
									that.getView().getModel("JMExt").getData().ERFMG_HELP = false;
									that.getView().getModel("JMExt").refresh(true);

								} else {
									//that.getView().byId("id_reportsBtn").setVisible(true);//reports Button
									that.getView().getModel("JMExt").getData().UMSKZ = false;
									that.getView().getModel("JMExt").getData().NETPR = false;
									that.getView().getModel("localModel").setProperty("/showFuelFields", false); //capture Image
									that.getView().getModel("localModel").setProperty("/hideFuelFields", true);
								}

								that.getView().getModel("JMExt").refresh();
							} else {
								for (i = 0; i < oData.results[0].GetFieldOutNav.results.length; i++) {
									vTemp = oData.results[0].GetFieldOutNav.results[i].Fld;
									that.oDisplayIN[vTemp] = true;
									if (oData.results[0].GetFieldOutNav.results[i].Req === "X") {
										that.oDisplayIN[vTemp + "_REQ"] = true;
									} else {
										that.oDisplayIN[vTemp + "_REQ"] = false;
									}
									if (oData.results[0].GetFieldOutNav.results[i].Disp === "X") {
										that.oDisplayIN[vTemp + "_DISP"] = false;
									} else {
										that.oDisplayIN[vTemp + "_DISP"] = true;
									}

									if (oData.results[0].GetFieldOutNav.results[i].HelpType !== "") {
										that.oDisplayIN[vTemp + "_HELP"] = true;
									} else {
										that.oDisplayIN[vTemp + "_HELP"] = false;
									}

									if (oData.results[0].GetFieldOutNav.results[i].Cname !== "") {
										that.oDisplayIN[vTemp + "_NAME"] = oData.results[0].GetFieldOutNav.results[i].Cname;
									} else {
										that.oDisplayIN[vTemp + "_NAME"] = oData.results[0].GetFieldOutNav.results[i].Fname;
									}
								}
								// checking if vehicle type available or not added by Laxmikanth
								var oVehicleTypeisTrue = oData.results[0].GetFieldOutNav.results.filter(function (params) {
									return params.Fld === "VEHOWN" || params.Fld === "NCOMVEH" || params.Fld === "COMVEH"
								});
								if (oVehicleTypeisTrue.length > 0) {
									that.oVehicleTypeisTrueAvailable = true;
								} else {
									that.oVehicleTypeisTrueAvailable = false;
								}
								if(oData.results[0].Requester === 'X' && oData.results[0].FuelIssue === "X"){
									that.getView().byId("id_reportsBtn").setVisible(true); //reports Button
								}else{
									that.getView().byId("id_reportsBtn").setVisible(false); //reports Button
								}
								if (oData.results[0].FuelIssue === "X") {
									if (oData.results[0].Issuer === 'X') {
										that.getView().getModel("localModel").setProperty("/showFuelFields", true); //capture Image
										that.getView().getModel("localModel").setProperty("/hideFuelFields", false);
										that.getView().byId("id_scanInternalVehicle").setVisible(true); //scanner
										//that.getView().byId("id_reportsBtn").setVisible(false); //reports Button
										that.getView().getModel("JMInt").getData().VEHNO_HELP = false;
										that.getView().getModel("JMInt").getData().DNAME_DISP = false;
										that.getView().getModel("JMInt").getData().DNAME_HELP = false;
										that.getView().getModel("JMInt").getData().VEHTYP_DISP = false;
										that.getView().getModel("JMInt").getData().MATNR_DISP = false;
										that.getView().getModel("JMInt").getData().MATNR_HELP = false;
										that.getView().getModel("JMInt").getData().LGORT_DISP = true;
										that.getView().getModel("JMInt").getData().LGORT_HELP = true;

										that.getView().getModel("JMInt").getData().VEHNO_DISP = false;
										that.getView().getModel("JMInt").getData().VEHNO_HELP = false;
										that.getView().getModel("JMInt").getData().SAKNR_DISP = false;
										that.getView().getModel("JMInt").getData().SAKNR_HELP = false;
										that.getView().getModel("JMInt").getData().ERFMG_DISP = true;
										that.getView().getModel("JMInt").getData().ERFMG_HELP = false;
										that.getView().getModel("JMInt").getData().KOSTL_DISP = false;
										that.getView().getModel("JMExt").getData().UMSKZ = false;
										that.getView().getModel("JMExt").getData().NETPR = false;

										that.getView().getModel("JMInt").getData().COMVEH_DISP = false;
										that.getView().getModel("JMInt").getData().NCOMVEH_DISP = false;
										that.getView().getModel("JMInt").refresh(true);

									} else {
										that.getView().getModel("JMInt").getData().COMVEH_DISP = true;
										that.getView().getModel("JMInt").getData().NCOMVEH_DISP = true;
										that.getView().getModel("JMExt").getData().UMSKZ = false;
										that.getView().getModel("JMExt").getData().NETPR = false;
										that.getView().getModel("JMInt").getData().WBID = false;
									//	that.getView().byId("id_reportsBtn").setVisible(true);//reports Button
										that.getView().getModel("localModel").setProperty("/showFuelFields", false); //capture Image
										that.getView().getModel("localModel").setProperty("/hideFuelFields", true);
										that.getView().byId("id_scanInternalVehicle").setVisible(false);//scanner
									}
								}
								//end by laxmi
								that.getView().getModel("JMInt").refresh();
							}
						}
						busyDialog.close();
					},
					error: function (Ierror) {
						busyDialog.close();
					}
				});
			}
		},
		onSetPostModel: function () {
			var oSelf = this;
			//Changed by AVinash
			// Wbid
			// Ajahr
			// Werks
			// Direction
			// Wtype
			// Vehno
			// Vehtyp
			// Lifnr
			// Dname
			// DriverId
			// DriverMob
			// Challan
			// Vbeln
			// Prtyp
			// Matnr
			// Erfmg
			// Erfme
			// Cnnum

			if (oSelf.getView().getModel("REZExtModel") !== undefined) {
				if (oSelf.getView().getModel("REZExtModel").getData().Werks) {
					var oEntity = {
						"Images": [],
						"Werks": oSelf.getView().getModel("REZExtModel").getData().Werks,
						"Matnr": "",
						"Maktx": "",
						"Lifnr": "",
						"Litxt": "",
						"Gate": "",
						"Vehno": "",
						"Vehtyp": "",
						"Dname": "",
						"DriverMob": "",
						"Remark": "",
						"Wtype": "",
						"Erdat": null,
						"Ertim": "PT00H00M00S",
						"Name1": oSelf.getView().getModel("REZExtModel").getData().Name1,
						"VendorName": "",
						"LifnrDesc": "",
						"Wbid": "",
						"DoNo": "",
						"Token": "",
						"PO": "",
						// Added by Avinash
						"SWerks": "",
						"Bukrs": "",
						"Trnsid": "",
						"Item": "",
						"Otnum": "",
						"Bmcnu": "",
						"Bnnum": "",
						"Shipl": "",
						"Frefo": "",
						"Cnnum": "",
						"Dname_Mob": "",
						"LifnrName": "",
						"Challan": "",
						"DriverId": "",
						"Vbeln": "",
						"Erfmg": "",
						"Erfme": "",
						"Lgort": "" ,//added by srinivas on 15/09/2025
						"umskz":"",
						"netpr":""
					};
				}
			} else {
				var oEntity = {
					"Images": [],
					"Werks": "",
					"Matnr": "",
					"Maktx": "",
					"Lifnr": "",
					"Litxt": "",
					"Gate": "",
					"Vehno": "",
					"Vehtyp": "",
					"Dname": "",
					"DriverMob": "",
					"Remark": "",
					"Wtype": "",
					"Erdat": null,
					"Ertim": "PT00H00M00S",
					"Name1": "",
					"VendorName": "",
					"LifnrDesc": "",
					"Wbid": "",
					"DoNo": "",
					"Token": "",
					"PO": "",
					"Vbeln": "",
					"SWerks": "",
					"Bukrs": "",
					"Trnsid": "",
					"Item": "",
					"Otnum": "",
					"Bmcnu": "",
					"Bnnum": "",
					"Shipl": "",
					"Frefo": "",
					"Cnnum": "",
					"Dname_Mob": "",
					"LifnrName": "",
					"Challan": "",
					"DriverId": "",
					"Erfmg": "",
					"Erfme": "",
					"Lgort": "", //added by srinivas on 15/09/2025
					"umskz":"",
					"netpr":""
				};
			}
			//End of changes...

			oSelf.getView().setModel(new JSONModel(oEntity), "REZExtModel");
			var oEntity1 = {
				"Remark": "",
				"Wbid": "",
				"TranslipNo": "",
				"Trwgt": "",
				"Brgew": "",
				"Matnr": "",
				"Erfmg": "",
				"Erfme": "",
				"Cnnum": "",
				"Bmcnu": "",
				"Otnum": "",
				"Shipl": "",
				"Frefo": "",
				"Vehno": "",
				"Lifnr": "",
				"Vehtyp": "",
				"Dname": "",
				"Dname_Mob": "",
				"Token": "", //Driver License
				"saknr":"",

			};
			oSelf.getView().setModel(new JSONModel(oEntity1), "REZIntModel");

			that.oDisplayEXT = {
				"WBID": false,
				"WBID_REQ": false,
				"WBID_DISP": false,
				"WBID_NAME": "",
				"WBID_HELP": false,

				"MATNR": false,
				"MATNR_REQ": false,
				"MATNR_DISP": false,
				"MATNR_NAME": "",
				"MATNR_HELP": false,

				"VEHNO": false,
				"VEHNO_REQ": false,
				"VEHNO_DISP": false,
				"VEHNO_NAME": "",
				"VEHNO_HELP": false,

				"LIFNR": false,
				"LIFNR_REQ": false,
				"LIFNR_DISP": false,
				"LIFNR_NAME": "",
				"LIFNR_HELP": false,

				"CNNUM": false,
				"CNNUM_REQ": false,
				"CNNUM_DISP": false,
				"CNNUM_NAME": "",
				"CNNUM_HELP": false,

				"CHALLAN": false,
				"CHALLAN_REQ": false,
				"CHALLAN_DISP": false,
				"CHALLAN_NAME": "",
				"CHALLAN_HELP": false,

				"VEHTYP": false,
				"VEHTYP_REQ": false,
				"VEHTYP_DISP": false,
				"VEHTYP_NAME": "",
				"VEHTYP_HELP": false,

				"DRIVER_ID": false,
				"DRIVER_ID_REQ": false,
				"DRIVER_ID_DISP": false,
				"DRIVER_ID_NAME": "",
				"DRIVER_ID_HELP": false,

				"DRIVER_MOB": false,
				"DRIVER_MOB_REQ": false,
				"DRIVER_MOB_DISP": false,
				"DRIVER_MOB_NAME": "",
				"DRIVER_MOB_HELP": false,

				"EBELN": false,
				"EBELN_REQ": false,
				"EBELN_DISP": false,
				"EBELN_NAME": "",
				"EBELN_HELP": false,

				"VBELN": false,
				"VBELN_REQ": false,
				"VBELN_DISP": false,
				"VBELN_NAME": "",
				"VBELN_HELP": false,

				"ERFMG": false,
				"ERFMG_REQ": false,
				"ERFMG_DISP": false,
				"ERFMG_NAME": "",
				"ERFMG_HELP": false,

				"ERFME": false,
				"ERFME_REQ": false,
				"ERFME_DISP": false,
				"ERFME_NAME": "",
				"ERFME_HELP": false,

				"DNAME": false,
				"DNAME_REQ": false,
				"DNAME_DISP": false,
				"DNAME_NAME": "",
				"DNAME_HELP": false,

				// added by srinivas on 15/09/2025
				"LGORT": false,
				"LGORT_REQ": false,
				"LGORT_DISP": false,
				"LGORT_NAME": "",
				"LGORT_HELP": false,
				// ended by srinivas

				//Added by Laxmikanth
				"VEHOWN": false,
				"VEHOWN_REQ": false,
				"VEHOWN_DISP": false,
				"VEHOWN_NAME": "",
				"VEHOWN_HELP": false,
				
				"NCOMVEH": false,
				"NCOMVEH_REQ": false,
				"NCOMVEH_DISP": false,
				"NCOMVEH_NAME": "",
				"NCOMVEH_HELP": false,

				"COMVEH": false,
				"COMVEH_REQ": false,
				"COMVEH_DISP": false,
				"COMVEH_NAME": "",
				"COMVEH_HELP": false,
				
				"SAKNR": false,
				"SAKNR_REQ": false,
				"SAKNR_DISP": false,
				"SAKNR_NAME": "",
				"SAKNR_HELP": false,

				"UMSKZ": false,
				"UMSKZ_REQ": false,
				"UMSKZ_DISP": false,
				"UMSKZ_NAME": "",
				"UMSKZ_HELP": false,

				"NETPR": false,
				"NETPR_REQ": false,
				"NETPR_DISP": false,
				"NETPR_NAME": "",
				"NETPR_HELP": false,

				"KOSTL": false,
				"KOSTL_REQ": false,
				"KOSTL_DISP": false,
				"KOSTL_NAME": "",
				"KOSTL_HELP": false

			};
			oSelf.getView().setModel(new JSONModel(that.oDisplayEXT), "JMExt");

			that.oDisplayIN = {
				"WBID": false,
				"WBID_REQ": false,
				"WBID_DISP": false,
				"WBID_NAME": "",
				"WBID_HELP": false,

				"ITEM": false,
				"ITEM_REQ": false,
				"ITEM_DISP": false,
				"ITEM_NAME": "",
				"ITEM_HELP": false,

				"ERFMG": false,
				"ERFMG_REQ": false,
				"ERFMG_DISP": false,
				"ERFMG_NAME": "",
				"ERFMG_HELP": false,

				"ERFME": false,
				"ERFME_REQ": false,
				"ERFME_DISP": false,
				"ERFME_NAME": "",
				"ERFME_HELP": false,

				"MATNR": false,
				"MATNR_REQ": false,
				"MATNR_DISP": false,
				"MATNR_NAME": "",
				"MATNR_HELP": false,

				"CHALLAN": false,
				"CHALLAN_REQ": false,
				"CHALLAN_DISP": false,
				"CHALLAN_NAME": "",
				"CHALLAN_HELP": false,

				"BRGEW": false,
				"BRGEW_REQ": false,
				"BRGEW_DISP": false,
				"BRGEW_NAME": "",
				"BRGEW_HELP": false,

				"ERDAT": false,
				"ERDAT_REQ": false,
				"ERDAT_DISP": false,
				"ERDAT_NAME": "",
				"ERDAT_HELP": false,

				"TRWGT": false,
				"TRWGT_REQ": false,
				"TRWGT_DISP": false,
				"TRWGT_NAME": "",
				"TRWGT_HELP": false,

				"ERTIM": false,
				"ERTIM_REQ": false,
				"ERTIM_DISP": false,
				"ERTIM_NAME": "",
				"ERTIM_HELP": false,

				// Added by Avinash for IVC Rubber
				"BNNUM": false,
				"BNNUM_REQ": false,
				"BNNUM_DISP": false,
				"BNNUM_NAME": "",
				"BNNUM_HELP": false,

				"CNNUM": false,
				"CNNUM_REQ": false,
				"CNNUM_DISP": false,
				"CNNUM_NAME": "",
				"CNNUM_HELP": false,

				"BMCNU": false,
				"BMCNU_REQ": false,
				"BMCNU_DISP": false,
				"BMCNU_NAME": "",
				"BMCNU_HELP": false,

				"DNAME": false,
				"DNAME_REQ": false,
				"DNAME_DISP": false,
				"DNAME_NAME": "",
				"DNAME_HELP": false,

				"DRIVER_ID": false,
				"DRIVER_ID_REQ": false,
				"DRIVER_ID_DISP": false,
				"DRIVER_ID_NAME": "",
				"DRIVER_ID_HELP": false,

				"DRIVER_MOB": false,
				"DRIVER_MOB_REQ": false,
				"DRIVER_MOB_DISP": false,
				"DRIVER_MOB_NAME": "",
				"DRIVER_MOB_HELP": false,

				"FREFO": false,
				"FREFO_REQ": false,
				"FREFO_DISP": false,
				"FREFO_NAME": "",
				"FREFO_HELP": false,

				"LIFNR": false,
				"LIFNR_REQ": false,
				"LIFNR_DISP": false,
				"LIFNR_NAME": "",
				"LIFNR_HELP": false,

				"OTNUM": false,
				"OTNUM_REQ": false,
				"OTNUM_DISP": false,
				"OTNUM_NAME": "",
				"OTNUM_HELP": false,

				"SHIPL": false,
				"SHIPL_REQ": false,
				"SHIPL_DISP": false,
				"SHIPL_NAME": "",
				"SHIPL_HELP": false,

				"VEHTYP": false,
				"VEHTYP_REQ": false,
				"VEHTYP_DISP": false,
				"VEHTYP_NAME": "",
				"VEHTYP_HELP": false,

				"VEHNO": false,
				"VEHNO_REQ": false,
				"VEHNO_DISP": false,
				"VEHNO_NAME": "",
				"VEHNO_HELP": false,

				// added by srinivas on 15/09/2025
				"LGORT": false,
				"LGORT_REQ": false,
				"LGORT_DISP": false,
				"LGORT_NAME": "",
				"LGORT_HELP": false,
				// ended by srinivas

				//Added by Laxmikanth
				"VEHOWN": false,
				"VEHOWN_REQ": false,
				"VEHOWN_DISP": false,
				"VEHOWN_NAME": "",
				"VEHOWN_HELP": false,
				
				"NCOMVEH": false,
				"NCOMVEH_REQ": false,
				"NCOMVEH_DISP": false,
				"NCOMVEH_NAME": "",
				"NCOMVEH_HELP": false,

				"COMVEH": false,
				"COMVEH_REQ": false,
				"COMVEH_DISP": false,
				"COMVEH_NAME": "",
				"COMVEH_HELP": false,
				
				"SAKNR": false,
				"SAKNR_REQ": false,
				"SAKNR_DISP": false,
				"SAKNR_NAME": "",
				"SAKNR_HELP": false,

				"UMSKZ": false,
				"UMSKZ_REQ": false,
				"UMSKZ_DISP": false,
				"UMSKZ_NAME": "",
				"UMSKZ_HELP": false,

				"NETPR": false,
				"NETPR_REQ": false,
				"NETPR_DISP": false,
				"NETPR_NAME": "",
				"NETPR_HELP": false,

				"KOSTL": false,
				"KOSTL_REQ": false,
				"KOSTL_DISP": false,
				"KOSTL_NAME": "",
				"KOSTL_HELP": false

			};
			oSelf.getView().setModel(new JSONModel(that.oDisplayIN), "JMInt");
		},

		//===============================================================
		//-------------------Barcode Scan Function--------------------
		//===============================================================
		//Added by Avinash for Scanning Logic Changes -- Start
		loadZXingLibrary: function () {
			return new Promise((resolve, reject) => {
				var script = document.createElement('script');
				//script.src = "https://unpkg.com/@zxing/library@latest";
				script.src = sap.ui.require.toUrl("ZGT_MM_REZ/ScannerAppLibrary/index.min.js");
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});
		},

		onScanQRValue: function (oEvent) {
			var oThat = this;
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oVideoDeviceModel = new JSONModel();
			//Initialize the ZXing QR Code Scanner
			this.loadZXingLibrary().then(() => {
				codeReader = new ZXing.BrowserMultiFormatReader();
				codeReader.listVideoInputDevices().then((videoInputDevices) => {
					if (videoInputDevices.length > 1) {
						selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
					} else if (videoInputDevices.length === 1) {
						selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
					} else {
						sap.ndc.BarcodeScanner.scan(
							function (mResult) {
								if (!mResult.cancelled) {
									oThat.fnChangeEXT(mResult.text.trim());
								}
							},
							function (Error) {
								sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

							},
						);
					}
					if (videoInputDevices.length >= 1) {
						var aDevice = [];
						videoInputDevices.forEach((element) => {
							var sourceOption = {};
							sourceOption.text = element.label;
							sourceOption.value = element.deviceId;
							aDevice.push(sourceOption);
							oVideoDeviceModel.setData(aDevice);
							this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
							oComboBox = new sap.m.ComboBox({
								items: {
									path: "oVideoDeviceModel>/",
									template: new sap.ui.core.Item({
										key: "{oVideoDeviceModel>value}",
										text: "{oVideoDeviceModel>text}"
									})
								},
								selectedKey: selectedDeviceId,
								selectionChange: function (oEvt) {
									selectedDeviceId = oEvt.getSource().getSelectedKey();
									oThat._oScanQRDialog.close();
									codeReader.reset()

								}
							});

							sStartBtn = new sap.m.Button({
								text: oBundle.getText("Start"),
								type: oBundle.getText("Accept"),
								press: function () {
									oThat._oScanQRDialog.close();
									oThat.onScanQRValue();
								}

							})

							oThat.startScanning();
						})
					}
				});

			}).catch((error) => {

				console.error("Error loading ZXing library:", error);

			})
		},


		startScanning: function () {
			var oThat = this;
			var oView = oThat.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			try { //Checking barcodescanner plugin is available or not
				var s = cordova.plugins.barcodeScanner;
				if (s) {
					sApplicationFlag = true; // Barcode Scanner is avilable; Running in Fiori Client
				} else {
					sApplicationFlag = false; // Barcode Scanner is not-avilable
				}
			} catch (e) {
				sApplicationFlag = false; // Barcode Scanner is not avilable; Running in Browser
			}
			if (sApplicationFlag === false && sap.ui.Device.system.desktop === false) { //No Barcode Scanner Plugin and Mobile/Tablet Browser
				if (!this._oScanQRDialog) {
					this._oScanQRDialog = new sap.m.Dialog({
						title: oBundle.getText("ScanQRcode"),
						contentWidth: "640px",
						contentHeight: "480px",
						horizontalScrolling: false,
						verticalScrolling: false,
						stretchOnPhone: true,
						content: [
							new sap.ui.core.HTML({
								id: this.createId("scanContainer_QR"),
								content: "<video />"
							})
						],
						endButton: new sap.m.Button({
							text: oBundle.getText("Cancel"),
							press: function (oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function (mResult) {
										if (!mResult.cancelled) {
											oThat.fnChangeEXT(mResult.text.trim());
										}
									},
									function (Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function () {
							codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									this._oScanQRDialog.close();
									codeReader.reset()
									oThat.fnChangeEXT(result.text.trim());
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									// oView.byId("idInOutBond").setValue("");
								}
							})
						}.bind(this),
						afterClose: function () {}
					});
					oView.addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							if(oThat.Issuer === 'X'){
								oThat._validateScannedWB(mResult.text.trim());
							}else{
							oThat.fnChangeEXT(mResult.text.trim());
							}
						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}

		},
		//Scanning Logic Changes --- END

		onScanWbIdEXT: function (oEvent) {
			var oThat = this;
			if (!oEvent.getParameters().cancelled) {
				if (oEvent.getParameter("text")) {
					var vWbId = oEvent.getParameter("text");
					this.fnChangeEXT(vWbId);
				}
			}
		},
		fnChangeScan: function (oEvent) {
			var self = this;
			var vWbId = oEvent.getSource().getValue();
			self.fnChangeEXT(vWbId);
		},

		fnChangeEXT: function (vWbId) {
			var that = this;
			vWbId = vWbId.trim();
			if (vWbId && that.Werks) {
				var oModel = that.getOwnerComponent().getModel();
				sap.ui.core.BusyIndicator.show();
				oModel.read("/GetInputSet", {
					filters: [new Filter("Wbid", sap.ui.model.FilterOperator.EQ, vWbId),
						new Filter("Werks", sap.ui.model.FilterOperator.EQ, that.Werks)
					],
					urlParameters: {
						$expand: "GetOutputNav,GetReturnNav"
					},
					async: true,
					success: function (Idata, Iresponse) {
						if (Idata.results[0].GetReturnNav && Idata.results[0].GetReturnNav.results.length > 0) {
							var len = Idata.results[0].GetReturnNav.results.length - 1;
							sap.m.MessageBox.error(Idata.results[0].GetReturnNav.results[len].Message);
							that.getView().getModel("JMExt").getData().Wbid = "";
							that.getView().getModel("JMExt").refresh();
							that.postExtClear();
						} else {
							that.getView().setModel(new JSONModel(Idata.results[0].GetOutputNav.results), "OModel");
							that.getView().getModel("REZExtModel").getData().Vehno = Idata.results[0].GetOutputNav.results[0].Vehno;
							that.getView().getModel("REZExtModel").getData().Vbeln = Idata.results[0].GetOutputNav.results[0].Vbeln;
							that.getView().getModel("REZExtModel").getData().Vehtyp = Idata.results[0].GetOutputNav.results[0].Vehtyp;
							that.getView().getModel("REZExtModel").getData().Wbid = Idata.results[0].GetOutputNav.results[0].Wbid;
							that.getView().getModel("REZExtModel").getData().Lifnr = Idata.results[0].GetOutputNav.results[0].Lifnr;
							that.getView().getModel("REZExtModel").getData().Litxt = Idata.results[0].GetOutputNav.results[0].Litxt;
							that.getView().getModel("REZExtModel").getData().Challan = Idata.results[0].GetOutputNav.results[0].Challan;
							that.getView().getModel("REZExtModel").getData().Dname = Idata.results[0].GetOutputNav.results[0].Dname;
							that.getView().getModel("REZExtModel").getData().DriverMob = Idata.results[0].GetOutputNav.results[0].DriverMob;
							that.getView().getModel("REZExtModel").getData().Erfmg = Idata.results[0].GetOutputNav.results[0].Erfmg;
							that.getView().getModel("REZExtModel").getData().Cnnum = Idata.results[0].GetOutputNav.results[0].Cnnum;
							if (Idata.results[0].GetOutputNav.results[0].Matnr) {
								that.getView().getModel("REZExtModel").getData().Matnr = Idata.results[0].GetOutputNav.results[0].Matnr;
								that.getView().getModel("REZExtModel").getData().Maktx = "";
							}
							if (that.getView().getModel("JMMatnr") !== undefined) {
								if (that.getView().getModel("JMMatnr").getData().length == 1) {
									if (that.getView().getModel("JMMatnr").getData()[0].Matnr && that.getView().getModel("JMMatnr").getData()[0].Maktx && that
										.getView().getModel("JMMatnr").getData()[0].Meins !== "") {
										that.getView().getModel("REZExtModel").getData().Matnr = Formatter.fnLeadingZeros(that.getView().getModel("JMMatnr").getData()[
											0].Matnr).toString();
										that.getView().getModel("REZExtModel").getData().Maktx = that.getView().getModel("JMMatnr").getData()[0].Maktx;
										that.getView().getModel("REZExtModel").getData().Erfme = that.getView().getModel("JMMatnr").getData()[0].Meins;
									}
								}
							}
							that.getView().getModel("REZExtModel").refresh();
							// that.getView().byId("PortINDateId").setDateValue(new Date());
							// that.getView().byId("PortINTimeId").setDateValue(new Date());
						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (Ierror) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show(Ierror.message);
					}
				});

			}
		},

		onPressBarcode: function () {
			var that = this;
			var vError = false;
			jQuery.sap.require("sap.ndc.BarcodeScanner");
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					try {
						vWbId = oResult.text.trim();
						if (vWbId && that.Werks) {
							// var vError = false;
							// this.ScanWbid(vWbId, that.Werks);
							var oModel = that.getOwnerComponent().getModel();
							// var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
							// 	"'and PgiFlag eq 'X'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
							var oPath = "GetInputSet?$filter=Wbid eq '" + vWbId +
								"'and Werks eq '4193'&$expand=GetOutputNav,GetReturnNav";
							// and Werks eq '4193' & $expand = GetOutputNav, GetReturnNav &
							that.BusyDialog.open();
							oModel.read(oPath, {
								success: function (Idata, Iresponse) {
									if (Idata.results[0].GetReturnNav && Idata.results[0].GetReturnNav.results.length > 0) {
										var len = Idata.results[0].GetReturnNav.results.length - 1;
										sap.m.MessageBox.information(Idata.results[0].InputReturnNav.results[len].Message);

									} else {
										that.getView().setModel(new JSONModel(Idata.results[0]), "REZExtModel");

									}
									that.BusyDialog.close();
								},
								error: function (Ierror) {
									that.BusyDialog.close();
								}
							});

						} else {
							vError = true;
						}
					} catch (e) {

					}
				},
				function (oError) {
					// sap.ui.core.BusyIndicator.hide();
				}
			);
			if (!vError) {
				if (vWbId) {
					this.ScanWbid(vWbId, that.Werks);
				}
			}
		},
		ScanWbid: function (vWbId, vWerks) {
			var that = this;
			var oModel = that.getOwnerComponent().getModel();
			that.BusyDialog.open();
			oModel.read("/GetInputSet", {
				filters: [new Filter("Wbid", sap.ui.model.FilterOperator.EQ, vWbId),
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, vWerks)

				],
				urlParameters: {
					$expand: "GetOutputNav,GetReturnNav"
				},
				// async: true,
				success: function (Idata, Iresponse) {
					if (Idata.results[0].GetReturnNav && Idata.results[0].GetReturnNav.results.length > 0) {
						var len = Idata.results[0].GetReturnNav.results.length - 1;
						sap.m.MessageBox.information(Idata.results[0].InputReturnNav.results[len].Message);
						// that.getView().byId("id_WbIdIN").setValue();
						// that.portInclear();
					} else {
						that.getView().setModel(new JSONModel(Idata.results[0]), "REZExtModel");
						// that.getView().byId("PortINDateId").setDateValue(new Date());
						// that.getView().byId("PortINTimeId").setDateValue(new Date());
					}
					that.BusyDialog.close();
				},
				error: function (Ierror) {
					that.BusyDialog.close();
				}
			});
		},

		fnSettings: function () {
			if (!this.oPlant) {
				this.oPlant = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.Plant", this);
				this.getView().addDependent(this.oPlant);
			}
			this.oPlant.open();
			this.fnLoadWerks();
		},

		fnLoadWerks: function () {
			var oModel = this.getOwnerComponent().getModel();
			// var oModel = this.getView().getModel("oData");
			var that = this;
			busyDialog.open();
			oModel.read("/F4ParameterSet", {
				filters: [
					new Filter("Werks", FilterOperator.EQ, 'X'),
					new Filter("Werksx", FilterOperator.EQ, 'X')
				],
				urlParameters: {
					$expand: "F4PlantNav"
				},

				success: function (oData, oResponse) {
					if (oData.results[0].F4PlantNav.results.length == 1) {
						oView.byId("id_Plant").setText(oData.results[0].F4PlantNav.results[0].Werks + '-' + oData.results[0].F4PlantNav.results[0].Name1);
						that.Werks = oData.results[0].F4PlantNav.results[0].Werks;
						if (oView.byId("id_pExternal").getVisible()) {
							that.Key = "EXT";
							that.onSetPostModel();
							that._onRouteMatched();
						} else if (oView.byId("id_pInternal").getVisible()) {
							that.Key = "INT";
							that.onSetPostModel();
							that._onRouteMatched();
						} else {
							sap.m.MessageToast.show(oi18n.getProperty('PlChooseType'));
						}
					}
					var oJSONModelPlant = new sap.ui.model.json.JSONModel();
					oJSONModelPlant.setData(oData.results[0].F4PlantNav.results);
					that.getView().setModel(oJSONModelPlant, "JMPlant");

					busyDialog.close();
				},
				error: function (oResponse) {
					busyDialog.close();
					sap.m.MessageToast.show(oResponse);
				}
			});
		},

		fnFilterWerks: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},

		fnFilterRez: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Rsnum", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("Sgtxt", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter4 = new sap.ui.model.Filter("Rspos", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},

		fn_ConfirmPlant: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (oItem) {
				oView.byId("id_Plant").setText(oItem.getTitle() + '-' + oItem.getDescription());
				this.Werks = oItem.getTitle();
				if (oView.byId("id_pExternal").getVisible()) {
					this.Key = "EXT";
					this.onSetPostModel();
					this._onRouteMatched(oEvent);
					this.getView().byId("id_reportsBtn").setVisible(true);
				} else if (oView.byId("id_pInternal").getVisible()) {
					this.Key = "INT";
					this.onSetPostModel();
					this._onRouteMatched(oEvent);
					this.getView().byId("id_reportsBtn").setVisible(true);
				} else {
					sap.m.MessageToast.show(oi18n.getProperty('PlChooseType'));
				}
			}
		},

		fnValueHelpVeh: function () {
			if (!this.oVehicle) {
				this.oVehicle = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.Vehicle", this);
				this.getView().addDependent(this.oVehicle);
			}
			this.oVehicle.open();
			this.fnLoadVehicle();
		},

		fnLoadVehicle: function () {
			var oModel = this.getOwnerComponent().getModel();
			busyDialog.open();
			oModel.read("/F4ParameterSet", {
				filters: [
					new Filter("Werks", FilterOperator.EQ, this.Werks),
					new Filter("Vehnox", FilterOperator.EQ, 'X')
				],
				urlParameters: {
					$expand: "F4VehicleNoNav"
				},
				success: function (oData, oResponse) {
					var oJSONModelPlant = new sap.ui.model.json.JSONModel();
					oJSONModelPlant.setData(oData.results[0].F4VehicleNoNav.results);
					that.getView().setModel(oJSONModelPlant, "JmVeh");
					busyDialog.close();
				},
				error: function (oResponse) {
					busyDialog.close();
					sap.m.MessageToast.show(oResponse);
				}
			});
		},

		fnFilterVeh: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Vehtyp", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter4 = new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("Dname", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},

		fn_ConfirmVeh: function (oEvent) {
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			self.VehicleObject = oSelectedItem.getBindingContext("JmVeh").getObject();
			self.getView().getModel("REZIntModel").getData().Vehno = oSelectedItem.getTitle();
			var vVehTyp = oEvent.getParameter('selectedItem').getAttributes()[0].getText();
			var vEmpName = oEvent.getParameter('selectedItem').getAttributes()[1].getText();
			self.Kostl = oEvent.getParameter('selectedItem').getAttributes()[2].getText();
			self.getView().getModel("REZIntModel").getData().Vehtyp = vVehTyp;
			self.getView().getModel("REZIntModel").getData().Dname = vEmpName;
			self.getView().getModel("REZIntModel").refresh(true);
		},

		fnf4Matnr: function () {
			if (!this.oMatnr) {
				this.oMatnr = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.Material", this);
				this.getView().addDependent(this.oMatnr);
			}
			this.oMatnr.open();
			this.fnLoadMatnr();
		},
		fnLoadMatnr: function () {
			var oModel = this.getOwnerComponent().getModel();
			this.Werks = this.Werks || "";
			busyDialog.open();
			oModel.read("/F4ParameterSet", {
				filters: [
					new Filter("Werks", FilterOperator.EQ, this.Werks),
					new Filter("Matnrx", FilterOperator.EQ, 'X'),
					//added by srinivas on 15/08/2025
					new Filter("Prtyp", FilterOperator.EQ, this.Key ),
					//ended
				],
				urlParameters: {
					$expand: "F4MaterialNav"
				},

				success: function (oData, oResponse) {

					var oJSONModelPlant = new sap.ui.model.json.JSONModel();
					oJSONModelPlant.setData(oData.results[0].F4MaterialNav.results);
					that.getView().setModel(oJSONModelPlant, "JMMatnr");

					busyDialog.close();
				},
				error: function (oResponse) {
					busyDialog.close();
					sap.m.MessageToast.show(oResponse);
				}
			});
		},
		fnFilterMatnr: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("Meins", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},

		fn_ConfirmMatnr: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (this.Key == "EXT") {
				self.getView().getModel("REZExtModel").getData().Matnr = oSelectedItem.getTitle();
				self.getView().getModel("REZExtModel").getData().Maktx = oSelectedItem.getIntro();
				self.getView().getModel("REZExtModel").getData().Erfme = oSelectedItem.getAttributes()[0].getText();
				// self.getView().getModel("REZExtModel").getData().Maktx = oSelectedItem.getInfo();
				//added by srinivas on 15/09/2025
				self.getView().getModel("REZExtModel").getData().MaxLiters = oSelectedItem.getAttributes()[2].getText();
				//end
				if (oSelectedItem.getAttributes()[0].getText()) {
					// if (this.Key == "EXT") {
					self.getView().getModel("REZExtModel").getData().ERFME = true;
					self.getView().getModel("REZExtModel").getData().ERFME_REQ2 = true;
					self.getView().getModel("REZExtModel").getData().ERFME_DISP2 = true;
					self.getView().getModel("REZExtModel").getData().ERFME_NAME2 = true;
					self.getView().getModel("REZExtModel").getData().ERFME_HELP2 = true;
					// self.getView().getModel("REZExtModel").refresh();
				}
				self.getView().getModel("REZExtModel").refresh(true);
			} else {
				self.getView().getModel("REZIntModel").getData().Matnr = oSelectedItem.getTitle();
				self.getView().getModel("REZIntModel").getData().Maktx = oSelectedItem.getIntro();
				self.getView().getModel("REZIntModel").getData().Erfme = oSelectedItem.getAttributes()[0].getText();
				// self.getView().getModel("REZExtModel").getData().Maktx = oSelectedItem.getInfo();
					//added by srinivas on 15/09/2025
				self.getView().getModel("REZIntModel").getData().MaxLiters = oSelectedItem.getAttributes()[2].getText();
				//end
				if (oSelectedItem.getAttributes()[0].getText()) {
					// if (this.Key == "EXT") {
					self.getView().getModel("REZIntModel").getData().ERFME = true;
					self.getView().getModel("REZIntModel").getData().ERFME_REQ2 = true;
					self.getView().getModel("REZIntModel").getData().ERFME_DISP2 = true;
					self.getView().getModel("REZIntModel").getData().ERFME_NAME2 = true;
					self.getView().getModel("REZIntModel").getData().ERFME_HELP2 = true;
					// self.getView().getModel("REZExtModel").refresh();
				}
				self.getView().getModel("REZIntModel").refresh(true);
			}
		},

		fnSubmit: function (oEvent) {
			if (this.Key) {
				if (this.Key == "EXT") {
					this.fnPostExternal();
					// var vOtherTare = Number(vOtherTareWt).toFixed(3);
				} else {
					this.fnPostInternal();
				}
			} else {
				sap.m.MessageToast.show(oi18n.getProperty('PlChooseType'));
			}
		},

		fnLivechangeInputNum: function (oEvent) {
			// added by srinivas on 15/08/2025
			var oInput = oEvent.getSource();
			var svalue = oInput.getValue().trim();
			if (that.FuelIssue === "X") {
				if (that.Issuer === 'X') {
					if (!oThat._checkAttachments(false)) {
						svalue = "";
						oEvent.getSource().setValue(svalue);
						return; // stop if attachments not valid
					}
				}
			//ended by srinivas

			//var svalue = oEvent.getSource().getValue();
			//svalue = svalue.replace(/[^\d.]/g, '');
			//var index = svalue.indexOf(".");
			//added by srinivas on 15/08/2025
			// checked if Ext or Int vehicle quantity
			if(oThat.Key === "INT"){
				var MaxLiters = oThat.getView().getModel("REZIntModel").getData().MaxLiters.trim();
			}else{
			var MaxLiters = oThat.getView().getModel("REZExtModel").getData().MaxLiters.trim();
			}
			if(MaxLiters == undefined){
				var	vErrMsg =  oThat.getView().getModel("i18n").getResourceBundle().getText("SelectMatnrError");
				MessageBox.error(vErrMsg);
				return;
			}
		
	        var fValue = Number(svalue);     
            var fMaxLiters = Number(MaxLiters);
			if(fValue > fMaxLiters){
			var	vErrMsg =  oThat.getView().getModel("i18n").getResourceBundle().getText("LimitExceed") 
				MessageBox.error(vErrMsg);
				svalue = "";
				oEvent.getSource().setValue(svalue);
				return;
			}
		}
			// end
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
		},

		fnPostInternal: function () {
			var vErr = false;
			var vErrMsg = "";
			var that = this;
			var self = this;
			// if (!self.getView().getModel("REZIntModel").getData().Wbid) {
			// 	vErr = true;
			// 	vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendWbidMand") + "\n";
			// }
			//Added by Laxmikanth if selected or not vehicle type
			if(self.getView().getModel("JMInt").getData().VEHOWN && !self.getView().byId("id_compVehicleRadioBtn").getSelected() && !self.getView().byId("id_NoncompVehicleRadioBtn").getSelected()){
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("sendVehicleType") + "\n";
			}
			if (!self.getView().getModel("REZIntModel").getData().Matnr) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendMatnrMand") + "\n";
			}
			if (!self.getView().getModel("REZIntModel").getData().Erfmg) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendErfmgMand") + "\n";
			}
			if (!self.getView().getModel("REZIntModel").getData().Vehno) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendVehnoMand") + "\n";
			}
			if (!self.getView().getModel("REZIntModel").getData().Vehno) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendVehtypMand") + "\n";
			}
			if (!self.getView().getModel("REZIntModel").getData().Dname) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendDnameMand") + "\n";
			}
			if (self.getView().getModel("REZIntModel").getData().Erfmg == "0" || self.getView().getModel("REZIntModel").getData().Erfmg ==
				"0.000") {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendPropErfmgMand") + "\n";
			}
				// added by srinivas on 15/09/2025 for diesel issue // Check base 3 + 4th attachment
			if (that.FuelIssue === "X") {
				if (that.Issuer === 'X') { // checked if vehicle type available or not // added by laxmi
					if (!self._checkAttachments(true)) {
						return; // stop if missing anything
					}
				}
		}
			//end
			

			if (!vErr) {
				var vErfmg = (Number(self.getView().getModel("REZIntModel").getData().Erfmg).toFixed(3));
				//checked if Anlnl and Kostl is available or not , added by laxmikanth
				if(self.VehicleObject){
					var Anln1 = self.VehicleObject.Anln1;
				}else{
					var Anln1 = '';
				}
				if(self.Kostl){
					self.Kostl = self.Kostl;
				}else{
					self.Kostl = self.getView().getModel("REZIntModel").getData().kostl;
				}
				var payLoad = {
					"d": {
						"Prtyp": "INT",
						"Wbid": self.getView().getModel("REZIntModel").getData().Wbid || "",
						"Werks": that.Werks,
						"Vehno": self.getView().getModel("REZIntModel").getData().Vehno,
						"Vehtyp": self.getView().getModel("REZIntModel").getData().Vehtyp,
						"Matnr": self.getView().getModel("REZIntModel").getData().Matnr,
						// "Lifnr": self.getView().getModel("REZIntModel").getData().Lifnr,
						// "Vbeln": self.getView().getModel("REZIntModel").getData().Vbeln,
						// "Cnnum": self.getView().getModel("REZIntModel").getData().Cnnum,
						"Dname": self.getView().getModel("REZIntModel").getData().Dname,
						// "DriverMob": self.getView().getModel("REZIntModel").getData().DriverMob,
						// "Challan": self.getView().getModel("REZIntModel").getData().Challan,
						"Erfmg": vErfmg,
						"Erfme": self.getView().getModel("REZIntModel").getData().Erfme,
						"Kostl": self.Kostl,
						//"Anln1": self.VehicleObject.Anln1,
						"Anln1": Anln1 || '',
						"Sloc" : self.getView().getModel("REZIntModel").getData().Lgort || "",
						"OwnerShip": self.getView().getModel("REZIntModel").getData().OwnerShip === "X" ? "X" : "",
						"GlAct": self.getView().getModel("REZIntModel").getData().saknr,
						"PostReturnNav": [],
						 "DmsPostNav": []  //added by srinivas on 15/09/2025
					}
				};
				//added by srinivas on 15/09/2025
				if (oThat.Images && oThat.Images.length > 0) {
					oThat.Images.forEach(function (x) {
						payLoad.d.DmsPostNav.push({
							"Dokar": "",
							"Doknr": x.Doknr,
							"Dokvr": "",
							"Doktl": "",
							"Dokob": "",
							"Object": "",
							"Objky": "",
							"Fname": x.Fname,
							"Ftype": x.Ftype,
							"Filename": x.Filename
						});
					})
				}
              //ended
				busyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/PostInputSet", payLoad, {
					success: function (oData, oResponse) {
						busyDialog.close();
						if (oData.PostReturnNav.results[0].Type === 'S') {
							// var len = oData.PostReturnNav.results.length - 1;
							// sap.m.MessageBox.success(oData.PostReturnNav.results[len].Message);
							// // self.postDms(oData.PostHeadNav.results[0].Wbid);
							// self.postIntclear();
							var vSuccMsg = "";
							if (oData.PostReturnNav.results.length > 0) {
								for (var i = 0; i < oData.PostReturnNav.results.length; i++) {
									vSuccMsg = vSuccMsg + oData.PostReturnNav.results[i].Message + "\n";
									// vSuccMsg = vSuccMsg + "\r\n" + oData.PostReturnNav.results[i].Message;
								}
							}
							sap.m.MessageBox.success(vSuccMsg, {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: self.oView.getModel("i18n").getResourceBundle().getText("Success"),
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (oAction) {
									if (oAction == 'OK') {
										sap.m.MessageBox.show(self.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: sap.m.MessageBox.Icon.INFORMATION,
											title: self.oView.getModel("i18n").getResourceBundle().getText("Confirm"),
											actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
											onClose: function (oAction) {
												if (oAction === 'YES') {
													// added by srinivas on 29/09/2025 diesel issue
													var sServiceUrl = self.getOwnerComponent().getModel().sServiceUrl;
													if (that.FuelIssue === "X") {
														var vMaterialDoc = oData.PostReturnNav.results[0].MessageV3;
														var sRead = "/MatPrintSet(Wbid='" + vMaterialDoc + "')/$value";
													} else {
														// ended 
														var vWbid = oData.PostReturnNav.results[0].MessageV2;
														var vItem = oData.PostReturnNav.results[0].MessageV3;
														//var sServiceUrl = self.getOwnerComponent().getModel().sServiceUrl;
														var sRead = "/ResPrintSet(Rsnum='" + vWbid + "',Rspos='" + vItem + "')/$value";
													}
													var pdfURL = sServiceUrl + sRead;
													if (sap.ui.Device.system.desktop) {
														self.initiatePdfDialog();
														var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
														self.oImageDialog.getContent()[0].setContent(oContent);
														self.oImageDialog.addStyleClass("sapUiSizeCompact");
														self.oImageDialog.open();
													} else {
														window.open(pdfURL);
													}
													self.postIntclear();
												} else {
													self.postIntclear();
												}
											}
										});
									}
								}
							});

						} else {
							var len = oData.PostReturnNav.results.length - 1;
							sap.m.MessageBox.error(oData.PostReturnNav.results[len].Message);
							self.postExtclear();
						}
					},
					error: function (oError) {
						busyDialog.close();
						sap.m.MessageToast.show(oError.message);
					}
				});
			} else {
				sap.m.MessageBox.error(vErrMsg);
			}
		},

		fnPostExternal: function () {
			var vErr = false;
			var vErrMsg = "";
			var that = this;
			var self = this;
		
			if (!self.getView().getModel("REZExtModel").getData().Wbid) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendWbidMand") + "\n";
			}
			if (!self.getView().getModel("REZExtModel").getData().Matnr) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendMatnrMand") + "\n";
			}
			if (!self.getView().getModel("REZExtModel").getData().Erfmg) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendErfmgMand") + "\n";
			}
			if (self.getView().getModel("REZExtModel").getData().Erfmg == "0" || self.getView().getModel("REZExtModel").getData().Erfmg ==
				"0.000") {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendPropErfmgMand") + "\n";
			}

				// added by srinivas on 15/09/2025 for diesel issue   // Check base 3 + 4th attachment
			if (that.FuelIssue === "X") {
				if (that.Issuer === 'X') {
					if (!self._checkAttachments(true)) {
						return; // stop if missing anything
					}
				}
			}
			//end

			// //added by Laxmikanth
			// if (!self.getView().getModel("REZExtModel").getData().netpr) {
			// 	vErr = true;
			// 	vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendunitPriceMand") + "\n";
			// }
			// if (!self.getView().getModel("REZExtModel").getData().umskz) {
			// 	vErr = true;
			// 	vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("SendGLIndecatorMand") + "\n";
			// }
			// //End

			if (!vErr) {
				var vErfmg = (Number(self.getView().getModel("REZExtModel").getData().Erfmg).toFixed(3));
				var payLoad = {
					"d": {
						"Prtyp": "EXT",
						"Wbid": self.getView().getModel("REZExtModel").getData().Wbid,
						"Werks": that.Werks,
						"Vehno": self.getView().getModel("REZExtModel").getData().Vehno,
						"Matnr": self.getView().getModel("REZExtModel").getData().Matnr,
						"Vehtyp": self.getView().getModel("REZExtModel").getData().Vehtyp,
						"Lifnr": self.getView().getModel("REZExtModel").getData().Lifnr,
						"Litxt": self.getView().getModel("REZExtModel").getData().Litxt,
						"Vbeln": self.getView().getModel("REZExtModel").getData().Vbeln,
						"Cnnum": self.getView().getModel("REZExtModel").getData().Cnnum,
						"Dname": self.getView().getModel("REZExtModel").getData().Dname,
						"DriverMob": self.getView().getModel("REZExtModel").getData().DriverMob,
						"Challan": self.getView().getModel("REZExtModel").getData().Challan,
						"Erfmg": vErfmg,
						"Erfme": self.getView().getModel("REZExtModel").getData().Erfme,
						"Sloc" :self.getView().getModel("REZExtModel").getData().Lgort || "",
						//"SplGL":self.getView().getModel("REZExtModel").getData().umskz,
						//"UnitPrice":self.getView().getModel("REZExtModel").getData().netpr,
						"PostReturnNav": [],
		                "DmsPostNav": []  //added by srinivas on 15/09/2025
					}
				};
				//added by srinivas on 15/09/2025
				if (oThat.Images && oThat.Images.length > 0) {
					oThat.Images.forEach(function (x) {
						payLoad.d.DmsPostNav.push({
							"Dokar": "",
							"Doknr": x.Doknr,
							"Dokvr": "",
							"Doktl": "",
							"Dokob": "",
							"Object": "",
							"Objky": "",
							"Fname": x.Fname,
							"Ftype": x.Ftype,
							"Filename": x.Filename
						});
					})
				}
              //ended
				busyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/PostInputSet", payLoad, {
					success: function (oData, oResponse) {
						busyDialog.close();
						if (oData.PostReturnNav.results[0].Type === 'S') {
							// var len = oData.PostReturnNav.results.length - 1;
							// sap.m.MessageBox.success(oData.PostReturnNav.results[len].Message);
							// // self.postDms(oData.PostHeadNav.results[0].Wbid);
							// self.postExtclear();
							var vSuccMsg = "";
							if (oData.PostReturnNav.results.length > 0) {
								for (var i = 0; i < oData.PostReturnNav.results.length; i++) {
									vSuccMsg = vSuccMsg + oData.PostReturnNav.results[i].Message + "\n";
								}
							}
							sap.m.MessageBox.success(vSuccMsg, {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: self.oView.getModel("i18n").getResourceBundle().getText("Success"),
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (oAction) {
									if (oAction == 'OK') {
										sap.m.MessageBox.show(self.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: sap.m.MessageBox.Icon.INFORMATION,
											title: self.oView.getModel("i18n").getResourceBundle().getText("Confirm"),
											actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
											onClose: function (oAction) {
												if (oAction === 'YES') {
														// added by srinivas on 29/09/2025 diesel issue
													var sServiceUrl = self.getOwnerComponent().getModel().sServiceUrl;
													if (that.FuelIssue === "X") {
														var vMaterialDoc = oData.PostReturnNav.results[0].MessageV3;
														var sRead = "/MatPrintSet(Wbid='" + vMaterialDoc + "')/$value";
													} else {
														// ended 
													var vWbid = oData.PostReturnNav.results[0].MessageV2;
													var vItem = oData.PostReturnNav.results[0].MessageV3;
													//var sServiceUrl = self.getOwnerComponent().getModel().sServiceUrl;
													var sRead = "/ResPrintSet(Rsnum='" + vWbid + "',Rspos='" + vItem + "')/$value";
													// var sRead = "/DownloadSet(IvWbid='" + vWbid2 + "',IvPrint='X',GateEntry='X')/$value";
													}
													var pdfURL = sServiceUrl + sRead;
													if (sap.ui.Device.system.desktop) {
														self.initiatePdfDialog();
														var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
														self.oImageDialog.getContent()[0].setContent(oContent);
														self.oImageDialog.addStyleClass("sapUiSizeCompact");
														self.oImageDialog.open();
														// that.postExtclear();
													} else {
														window.open(pdfURL);
														// that.postExtclear();
													}
													that.postExtClear();
												} else {
													that.postExtClear();
												}
											}
										});
									}
								}
							});

						} else {
							var len = oData.PostReturnNav.results.length - 1;
							sap.m.MessageBox.error(oData.PostReturnNav.results[len].Message);
							self.postExtClear();
						}
					},
					error: function (oError) {
						busyDialog.close();
						sap.m.MessageToast.show(oError.message);
					}
				});
			} else {
				sap.m.MessageBox.error(vErrMsg);
			}
		},
		postExtClear: function () {
			var oSelf = this;
			var oEntity = oSelf.getView().getModel("REZExtModel").getData();
			oEntity.Lifnr = "";
			oEntity.Litxt = "";
			oEntity.Vehno = "";
			oEntity.Vehtyp = "";
			oEntity.Dname = "";
			oEntity.DriverMob = "";
			oEntity.Wbid = "";
			oEntity.Cnnum = "";
			oEntity.Erfme = "";
			oEntity.Erfmg = "";
			oEntity.Challan = "";
			oEntity.Matnr = "";
			oEntity.Maktx = "";
			oEntity.Vbeln = "";
			oEntity.Lgort = ""; //added by srinivas on 23/09/2025
			oEntity.Description = ""; //added by srinivas on 23/09/2025
			oThat.Images = []; //added by srinivas on 23/09/2025
			oEntity.netpr = ""; //adde by Laxmikanth
			oEntity.umskz = ""; //adde by Laxmikanth
			var oMassModel = oThat.getView().getModel("MASS");
			if (oMassModel) {
				oMassModel.setData([]); // clear model data
				oMassModel.refresh(true); // optional: to update bindings
			}
//ended by srinivas on 23/09/2025
			oSelf.getView().getModel("REZExtModel").refresh();
		},
		postIntclear: function () {
			var oSelf = this;
			self.Kostl = "";
			self.VehicleObject = "";
			var oEntity = oSelf.getView().getModel("REZIntModel").getData();
			oEntity.Litxt = "";
			oEntity.Lifnr = "";
			oEntity.Vehno = "";
			oEntity.Vehtyp = "";
			oEntity.Dname = "";
			oEntity.DriverMob = "";
			oEntity.Wbid = "";
			oEntity.Cnnum = "";
			oEntity.Erfme = "";
			oEntity.Erfmg = "";
			oEntity.Challan = "";
			oEntity.Matnr = "";
			oEntity.Maktx = "";
			oEntity.Lgort = ""; //added by srinivas on 23/09/2025
			oEntity.Description = ""; //added by srinivas on 23/09/2025
			oThat.Images = []; //added by srinivas on 23/09/2025
			oEntity.saknr = ""; //added by Laxmikanth 
			var oMassModel = oThat.getView().getModel("MASS");
			if (oMassModel) {
				oMassModel.setData([]); // clear model data
				oMassModel.refresh(true); // optional: to update bindings
			}
//ended by srinivas on 23/09/2025
			oSelf.getView().getModel("REZIntModel").refresh();
		},

		fnOpenReprint: function (oEvent) {
			var oThat = this;
			// oThat.vId = oEvent.getSource().getId();
			if (oThat.Werks) {
				if (!this.oReprint) {
					this.oReprint = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.Reprint", this);
					this.getView().addDependent(this.oReprint);
				}
				this.oReprint.open();
			} else {
				sap.m.MessageBox.error(oThat.getView().getModel("i18n").getResourceBundle().getText("SelectPlant"));
			}
		},
		fnHandleResno: function () {
			var that = this;
			var vSelPlant = that.Werks;
			// var vSelDate = sap.ui.getCore().byId('id_SelectedDate').getValue();
			var vSelDate = sap.ui.getCore().byId('id_SelectedDate').getValue();
			var oDateValue = sap.ui.getCore().byId('id_SelectedDate').getDateValue();
			if (vSelDate) {
				if (!this.oWbIdDialog) {
					this.oWbIdDialog = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.Rez", this);
					this.getView().addDependent(this.oWbIdDialog);
				}
				this.oWbIdDialog.open();
				busyDialog.open();
				if (that.FuelIssue === "X") {
					var oModel = this.getOwnerComponent().getModel("reportModel");
					var aURLParam = ["$filter= CreationDate ge datetime'" + this.formatLocalToCustom(oDateValue) + "' and CreationDate le datetime'" + this.formatLocalToCustom(oDateValue) + "' and " + "Werks eq '" + vSelPlant + "'"];

					oModel.read("/GetDiselReportSet", {
						urlParameters: aURLParam,
						async: true,
						success: function (oData, oResponse) {
							busyDialog.close();
							var oJSONModelSize = new sap.ui.model.json.JSONModel();
							//oJSONModelSize.setData(oData.results[0].F4ReservationNav.results);
							if (oData.results.length > 0) {
								for (var i = 0; i < oData.results.length; i++) {
									oData.results[i].Rsnum = oData.results[i].ResNo;
									oData.results[i].Sgtxt = oData.results[i].Wbid;
									oData.results[i].Rspos = oData.results[i].OwnerShip;
									oData.results[i].Vehno = oData.results[i].Vehno;
								}
								oJSONModelSize.setData(oData.results);
								that.getView().setModel(oJSONModelSize, "JMRez");
								this.getView().getModel("JMRez").refresh(true);
							}
							if (oData.results.length === 0) {
								sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("NoTruck")) + " " + vSelPlant);
							}
						},
						error: function (oResponse) {
							busyDialog.close();
							sap.m.MessageToast.show(oResponse.message);
						}
					});

				} else {

					var oJSONModelSize = new sap.ui.model.json.JSONModel();
					oJSONModelSize.setData([]);
					that.getView().setModel(oJSONModelSize, "JMRez");
					var oModel = this.getView().getModel();
					//var oModel = this.getOwnerComponent().getModel("reportModel");
					oModel.read("/F4ParameterSet", {
						filters: [
							new sap.ui.model.Filter("Rsnumx", sap.ui.model.FilterOperator.EQ, 'X'),
							new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vSelPlant),
							new sap.ui.model.Filter("Rsdat", FilterOperator.EQ, vSelDate)
						],
						urlParameters: {
							$expand: "F4ReservationNav,F4ReturnNav"
						},
						async: true,
						success: function (oData, oResponse) {
							busyDialog.close();
							var oJSONModelSize = new sap.ui.model.json.JSONModel();
							oJSONModelSize.setData(oData.results[0].F4ReservationNav.results);
								that.getView().setModel(oJSONModelSize, "JMRez");
								that.getView().getModel("JMRez").refresh(true);
							
							if (oData.results.length === 0) {
								sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("NoTruck")) + " " + vSelPlant);
							}
						},
						error: function (oResponse) {
							busyDialog.close();
							sap.m.MessageToast.show(oResponse.message);
						}
					});
				}
			} else {
				sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("SelectDate"));
			}
		},
		formatLocalToCustom: function (date) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mi = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');

            return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.000`;
        },
		onCloseReprint: function () {
			var self = this;
			// sap.ui.getCore().byId('id_PrintWbId').setValue("");
			sap.ui.getCore().byId('id_SelectedDate').setValue("");
			sap.ui.getCore().byId('id_ReprintResNo').setValue("");
			sap.ui.getCore().byId('id_ReprintMaterial').setValue("");
			sap.ui.getCore().byId('id_Item').setValue("");
			self.oReprint.close();
		},
		fnReprint: function () {
			var self = this;
			// added by srinivas for fuel issue  on 26/09/2025
			if (that.FuelIssue === "X") {
				var vMaterialDoc = sap.ui.getCore().byId('id_ReprintMaterial').getValue();
				// if(vMaterialDoc){
				var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
				//var sRead = "/MatPrintSet(Wbid='" + vMaterialDoc + "')/$value";
				var sRead = "/MatPrintSet(Wbid='" + this.oWBID + "')/$value";
				var pdfURL = sServiceUrl + sRead;
				if (sap.ui.Device.system.desktop) {
					self.initiatePdfDialog();
					var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
					self.oImageDialog.getContent()[0].setContent(oContent);
					self.oImageDialog.addStyleClass("sapUiSizeCompact");
					self.oImageDialog.open();
				} else {
					window.open(pdfURL);
				}
				// } else {
				// 	sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("PleaseSelMaterial"));
				//  }
			}
			else {
				//ended
				var vWbid = sap.ui.getCore().byId('id_ReprintResNo').getValue();
				var vItem = sap.ui.getCore().byId('id_Item').getValue();
				if (vWbid) {
					var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
					var sRead = "/ResPrintSet(Rsnum='" + vWbid + "',Rspos='" + vItem + "')/$value";
					// var sRead = "/ResPrintSet(Rsnum='" + vWbid + "',Rspos='" + vItem +
					// 	"')/$value";
					var pdfURL = sServiceUrl + sRead;
					if (sap.ui.Device.system.desktop) {
						self.initiatePdfDialog();
						var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
						self.oImageDialog.getContent()[0].setContent(oContent);
						self.oImageDialog.addStyleClass("sapUiSizeCompact");
						self.oImageDialog.open();
					} else {
						window.open(pdfURL);
					}
				} else {
					sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("PleaseSelRez"));
				}
			}
		},

		fn_ConfirmRez: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			sap.ui.getCore().byId('id_ReprintResNo').setValue(oSelectedItem.getAttributes()[0].getText());
			sap.ui.getCore().byId('id_Item').setValue(oSelectedItem.getFirstStatus().getText());
			this.oWBID = oSelectedItem.getAttributes()[1].getText();
			// sap.ui.getCore().byId('id_ReprintVehNo').setValue(oSelectedItem.getInfo());
		},

		initiatePdfDialog: function () {
			var that = this;
			that.oImageDialog = new sap.m.Dialog({
				title: 'PDF',
				contentWidth: "100%",
				contentHeight: "",
				content: new sap.ui.core.HTML({}),
				beginButton: new sap.m.Button({
					text: 'Close',
					class: "sapUiSizeCompact",
					press: function () {
						that.oImageDialog.close();
					}
				})
			});
		},
		fnLivechangeInputTextNum: function (oEvent) {
			var svalue = oEvent.getSource().getValue();
			svalue = svalue.replace(/[^a-zA-Z0-9]/g, '');
			svalue = svalue.toUpperCase();
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
		},
		fnLivechangeInputTextNumSpace: function (oEvent) {
			var svalue = oEvent.getSource().getValue();
			svalue = svalue.replace(/[^a-zA-Z0-9 ]/g, '');
			svalue = svalue.toUpperCase();
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
		},
		fnLivechangeInputText: function (oEvent) {
			var svalue = oEvent.getSource().getValue();
			svalue = svalue.replace(/[^a-zA-Z]/g, '');
			svalue = svalue.toUpperCase();
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
		},
		//  added for diesel issue by srinivas on 12/09/2025
		onReports: function (oEvent) {
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.navTo("Reports");
			this.getOwnerComponent().getRouter().navTo("Reports", {
				sValue: this.Werks,
			});
		},

		onCaptureCamera: function () {
			var oThat = this;
			//   oThat.Images= []
			oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			oThat.oView.getModel("MASS").refresh(true);
			if (!oThat.oCapture) {
				oThat.oCapture = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.CaptureImage", oThat);
				oThat.oView.addDependent(oThat.oCapture);
			}

			oThat.oCapture.open();
		},
		fnAddBillClose: function () {
			oThat.Images = [];
			oThat.oCapture.close();
		},
		onBeforeUploadStarts: function (oEvent) {
			oThat.BusyDialog.open();
		},

		onFilePreview: function (oEvent) {
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();

			var oSource = oEvent.getSource();
			// Climb up parents until we find a sap.m.Dialog instance or root
			var oParent = oSource;
			while (oParent) {
				if (oParent.getMetadata && oParent.getMetadata().getName() === "sap.m.Dialog") {
					break; // Found the Dialog control
				}
				oParent = oParent.getParent && oParent.getParent();
			}

			if (!oParent) {
				sap.m.MessageToast.show("Dialog container not found");
				return;
			}

			var oDialog = oParent;

			var oPreviewContainer = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewContainer") !== -1;
			})[0];

			var oImagePreview = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("imagePreview") !== -1;
			})[0];

			var oPreviewTitle = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewTitle") !== -1;
			})[0];

			if (!oPreviewContainer || !oImagePreview || !oPreviewTitle) {
				sap.m.MessageToast.show("Preview controls not found");
				return;
			}

			var oContext = oSource.getBindingContext("MASS");
			var oData = oContext ? oContext.getObject() : null;

			if (!oData) {
				sap.m.MessageToast.show("File data not found");
				return;
			}

			var sUrl = oData.documentUrl || oData.url || "";
			var sFileName = oData.Fname || "";
			var fileExt = sFileName.split('.').pop().toLowerCase();

			if (!sUrl) {
				sap.m.MessageToast.show("Document preview not available");
				return;
			}

			if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(fileExt)) {
				oImagePreview.attachEventOnce("load", function () {
					oBusyDialog.close();
				});
				oImagePreview.attachEventOnce("error", function () {
					oBusyDialog.close();
					sap.m.MessageToast.show("Failed to load image preview");
				});

				oImagePreview.setSrc(sUrl);
				oPreviewTitle.setText("Preview: " + sFileName);
				oPreviewContainer.setVisible(true);
				//oBusyDialog.close();
			} else {
				//sap.m.MessageToast.show("Preview not available for this file type");
				//download other files
				oBusyDialog.close();
				var link = document.createElement("a");
				link.href = sUrl;
				link.download = sFileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		},

		onClosePreview: function (oEvent) {
			var oSource = oEvent.getSource();

			// Climb up parents to find sap.m.Dialog instance
			var oParent = oSource;
			while (oParent) {
				if (oParent.getMetadata && oParent.getMetadata().getName() === "sap.m.Dialog") {
					break; // found dialog
				}
				oParent = oParent.getParent && oParent.getParent();
			}

			if (!oParent) {
				// Dialog not found — just exit
				return;
			}

			var oDialog = oParent;

			var oPreviewContainer = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewContainer") !== -1;
			})[0];

			var oImagePreview = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("imagePreview") !== -1;
			})[0];

			var oPreviewTitle = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewTitle") !== -1;
			})[0];

			if (oPreviewContainer) oPreviewContainer.setVisible(false);
			if (oImagePreview) oImagePreview.setSrc("");
			if (oPreviewTitle) oPreviewTitle.setText("");
		},
		// end by srinivas on with press event for attachments preview on 11/08/2025
		// onChange: function (oEvent) {
		// 	const oUploadCollection = oEvent.getSource();
		// 	const aFiles = oEvent.getParameter("files");
		// 	const oFile = aFiles[0];

		// 	if (!oFile) return;

		// 	// Only compress images
		// 	if (!oFile.type.match(/image.*/)) {
		// 		sap.m.MessageToast.show("Only image files can be compressed.");
		// 		return;
		// 	}

		// 	const that = this;
		// 	const reader = new FileReader();

		// 	reader.onload = function (e) {
		// 		const img = new Image();
		// 		img.src = e.target.result;

		// 		img.onload = function () {
		// 			// Create a canvas
		// 			const canvas = document.createElement("canvas");
		// 			const ctx = canvas.getContext("2d");

		// 			// Resize logic (optional)
		// 			const maxWidth = 1024; // adjust as per need
		// 			const maxHeight = 768;
		// 			let width = img.width;
		// 			let height = img.height;

		// 			if (width > height && width > maxWidth) {
		// 				height *= maxWidth / width;
		// 				width = maxWidth;
		// 			} else if (height > maxHeight) {
		// 				width *= maxHeight / height;
		// 				height = maxHeight;
		// 			}

		// 			canvas.width = width;
		// 			canvas.height = height;
		// 			ctx.drawImage(img, 0, 0, width, height);

		// 			// Compress to 0.7 quality (70%)
		// 			canvas.toBlob(function (blob) {
		// 				const compressedFile = new File(
		// 					[blob],
		// 					oFile.name,
		// 					{ type: oFile.type, lastModified: Date.now() }
		// 				);

		// 				// Replace the original file
		// 				that._uploadCompressedFile(oUploadCollection, compressedFile);
		// 			}, oFile.type, 0.7);
		// 		};
		// 	};

		// 	reader.readAsDataURL(oFile);
		// },

		// _uploadCompressedFile: function (oUploadCollection, oCompressedFile) {
		// 	// Clear old items
		// 	oUploadCollection.removeAllItems();

		// 	// Create a new upload item
		// 	const oItem = new sap.m.UploadCollectionItem({
		// 		fileName: oCompressedFile.name,
		// 		mimeType: oCompressedFile.type
		// 	});

		// 	// Attach the compressed file manually
		// 	oItem._oFileObject = oCompressedFile;

		// 	oUploadCollection.addItem(oItem);
		// 	oUploadCollection.upload();
		// },
		// onCompleteUpload: function(oEvent) {
		// 	var oThat = this;
		// 	oThat.onClosePreview(oEvent);
		// 	var oView = this.getView();
		// 	var vRadio = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getId();
		// 	//Added by Avinash
		// 	var vRadioText = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getText();
		// 	if (oThat.Images.length != 0) {
		// 		for (var i = 0; i < oThat.Images.length; i++) {
		// 			if (oThat.Images[i].Doknr == vRadio) {
		// 				oThat.Images.splice(i, 1);
		// 				break;
		// 			}
		// 		}
		// 	}
		// 	//End of Added
		// 	//var file = oEvent.getSource().oFileUpload.files[0];
		// 	var file = oEvent.getSource()._getFileUploader()._aXhr[0]['file'];
		// 	var object = {};
		// 	object.Documentid = jQuery.now().toString();
		// 	// object.Fname = file.name;
		// 		var fileExt = "";
		// 	if (file && file.name) {
		// 		var dotIndex = file.name.lastIndexOf(".");
		// 		if (dotIndex !== -1) {
		// 			fileExt = file.name.substring(dotIndex); // includes the dot
		// 		}
		// 	}
		// 	object.Fname = vRadioText; //Changed by Avinash
		// 	object.Ftype = file.type;
		// 	object.Objky = "";
		// 	object.Doknr = vRadio;
		// 	object.documentUrl = URL.createObjectURL(file);

		// 	object.Fname = vRadioText.trim() + (fileExt ? "" + fileExt.toLowerCase() : ""); //added by srinivas on 11/08/2025 for file name ext
			
		// 	if (file) {
		// 		oThat.base64conversionMethod(object, file);
		// 		oThat.BusyDialog.close();
		// 	}
		// },
		// base64conversionMethod: function(object, file) {
		// 	var that = this;
		// 	if (!FileReader.prototype.readAsBinaryString) {
		// 		FileReader.prototype.readAsBinaryString = function(fileData) {
		// 			var binary = "";
		// 			var reader = new FileReader();
		// 			reader.onload = function(e) {
		// 				var bytes = new Uint8Array(reader.result);
		// 				var length = bytes.byteLength;
		// 				for (var i = 0; i < length; i++) {
		// 					binary += String.fromCharCode(bytes[i]);
		// 				}
		// 				that.base64ConversionRes = btoa(binary);

		// 			};
		// 			reader.readAsArrayBuffer(fileData);
		// 		};
		// 	}
		// 	var reader = new FileReader();
		// 	reader.onload = function(readerEvt) {
		// 		var binaryString = readerEvt.target.result;
		// 		that.base64ConversionRes = btoa(binaryString);
		// 		var oFile = file;
		// 		object.Filename = that.base64ConversionRes;
		// 		that.Images.unshift(object);
		// 		object = {}; //clear	
		// 		that.oView.getModel("MASS").setData(that.Images);
		// 		that.oView.getModel("MASS").refresh(true);
		// 	};
		// 	reader.readAsBinaryString(file);
		// },

		// onCompleteUpload: function (oEvent) {
		// 	var oThat = this;
		// 	oThat.onClosePreview(oEvent);

		// 	var vRadio = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getId();
		// 	var vRadioText = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getText();
		// 	if (oThat.Images.length != 0) {
		// 		for (var i = 0; i < oThat.Images.length; i++) {
		// 			if (oThat.Images[i].Doknr == vRadio) {
		// 				oThat.Images.splice(i, 1);
		// 				break;
		// 			}
		// 		}
		// 	}
		// 	var file = oEvent.getSource()._getFileUploader()._aXhr[0]['file'];
		// 	var object = {};
		// 	object.Documentid = jQuery.now().toString();
		// 	// added by srinivas on 11/08/2025 for file name ext
		// 	var fileExt = "";
		// 	if (file && file.name) {
		// 		var dotIndex = file.name.lastIndexOf(".");
		// 		if (dotIndex !== -1) {
		// 			fileExt = file.name.substring(dotIndex); // includes the dot
		// 		}
		// 	}
		// 	// end by srinivas on 11/08/2025
		// 	//object.Fname = vRadioText;// commented by srinivas on 11/08/2025
		// 	object.Fname = vRadioText.trim() + (fileExt ? "" + fileExt.toLowerCase() : ""); //added by srinivas on 11/08/2025 for file name ext
		// 	object.Ftype = file.type;
		// 	object.Objky = "";
		// 	object.Doknr = vRadio;

		// 	oEvent.getSource()._getFileUploader()._aXhr.splice(0, 1);
		// 	if (file) {
		// 		var reader = new FileReader();
		// 		var BASE64_MARKER = 'data:' + file.type + ';base64,';
		// 		reader.onloadend = (function (theFile) {
		// 			return function (evt) {
		// 				var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
		// 				var base64Data = evt.target.result.substring(base64Index);
		// 				object.Filename = base64Data;
		// 				// object.Url = BASE64_MARKER + base64Data;
		// 				object.documentUrl = URL.createObjectURL(file); // Used for preview //added by srinivas on 11/08/2025 for file name ext
		// 				oThat.Images.unshift(object);
		// 				// oThat.Images = object; //Added by Avinash
		// 				object = {}; //clear	
		// 				oThat.getView().setModel(new JSONModel(oThat.Images), "MASS");
		// 				oThat.getView().getModel("MASS").refresh(true);
		// 				oThat.BusyDialog.close();
		// 			};
		// 			// that.getBusy().setBusy(false);
		// 		})(file);
		// 	}
		// 	reader.readAsDataURL(file);

		// },
		_compressImage: function (file, quality = 0.9, maxWidth = 1280, maxHeight = 720) {
			return new Promise((resolve, reject) => {
				if (!file.type.startsWith("image/")) return resolve(file);
				const reader = new FileReader();
				reader.onload = e => {
					const img = new Image();
					img.onload = () => {
						const canvas = document.createElement("canvas");
						let width = img.width,
							height = img.height;
						if (width > height && width > maxWidth) {
							height *= maxWidth / width;
							width = maxWidth;
						} else if (height > maxHeight) {
							width *= maxHeight / height;
							height = maxHeight;
						}
						canvas.width = width;
						canvas.height = height;
						canvas.getContext("2d").drawImage(img, 0, 0, width, height);
						canvas.toBlob(blob => {
							resolve(new File([blob], file.name, {
								type: file.type
							}));
						}, file.type, quality);
					};
					img.onerror = reject;
					img.src = e.target.result;
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});
		},

		// -------------------- Image upload --------------------
		onFileChange: function (oEvent) {
			var oFile = oEvent.getParameter("files")[0];
			if (!oFile) return;

			var oThat = this;
			var vRadioBtn = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton();
			if (!vRadioBtn) {
				sap.m.MessageToast.show("Please select document type before upload");
				return;
			}

			var vRadioId = vRadioBtn.getId().split("--").pop();
			var vRadioText = vRadioBtn.getText();

			oThat.BusyDialog.open();

			oThat._compressImage(oFile, 0.9, 1280, 720).then(function (compressedFile) {
				var reader = new FileReader();
				reader.onloadend = function (evt) {
					var base64 = evt.target.result.split(",")[1];
					var fileExt = oFile.name.split(".").pop();

					var object = {
						Documentid: jQuery.now().toString(),
						Fname: vRadioText.trim() + "." + fileExt,
						Ftype: oFile.type,
						Filename: base64,
						Doknr: vRadioId,
						documentUrl: URL.createObjectURL(compressedFile)
					};

					// Remove existing entry of same radio type (if present)
					oThat.Images = oThat.Images.filter(img => img.Doknr !== vRadioId);
					oThat.Images.unshift(object);

					// oThat.getView().setModel(new sap.ui.model.json.JSONModel(oThat.Images), "MASS");
					// oThat.getView().getModel("MASS").refresh(true);

					oThat.getView().getModel("MASS").setData(oThat.Images);;
					oThat.getView().getModel("MASS").refresh(true);



					//var oModel = oThat.getView().getModel("MASS");
					//                 if (!oModel) {
					//                     oModel = new sap.ui.model.json.JSONModel(oThat.Images);
					//                     oThat.getView().setModel(oModel, "MASS");
					//                 } else {
					//                     oModel.refresh(true);
					//                 }

					oThat.BusyDialog.close();
				};
				reader.readAsDataURL(compressedFile);
			}).catch(function (err) {
				console.error("Compression failed", err);
				oThat.BusyDialog.close();
			});
		},
		onFileDeleted: function (oEvent) {
			// var vDocumentid = oEvent.getParameter("documentId");
			// for (var i = 0; i < oThat.Images.length; i++) {
			// 	if (oThat.Images[i].Documentid == vDocumentid) {
			// 		oThat.Images.splice(oThat.Images[i], 1);
			// 		break;
			// 	}
			// }
			// oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			// oThat.oView.getModel("MASS").refresh(true);

			var vDocId = oEvent.getParameter("listItem").getBindingContext("MASS").getObject().Documentid;
            this.Images = this.Images.filter(img => img.Documentid !== vDocId);
            this.getView().getModel("MASS").setData(this.Images);
            this.getView().getModel("MASS").refresh(true);
            this.onClosePreview(oEvent);

			// Hide preview if deleted file was showing // added by srinivas on 14/08/2025 to clear preview
			var oPreviewImage = oThat.byId("imagePreview");
			var oPreviewContainer = oThat.byId("previewContainer");
			if (oPreviewImage && oPreviewImage.getSrc()) {
				// Check if previewed image was the one deleted
				var sPreviewSrc = oPreviewImage.getSrc();
				var wasDeleted = sPreviewSrc && sPreviewSrc.includes(vDocumentid);

				if (wasDeleted && oPreviewContainer) {
					oPreviewImage.setSrc(""); // Clear the image
					oPreviewContainer.setVisible(false); // Hide the preview box
				}
			}
			// ended by srinivas on 14/08/2025	
		},




		fnOKImages: function () {
			var oThat = this;
			if (!oThat._checkAttachments(false)) {
				return; // stop if attachments not valid
			}

			// If all uploaded, close the fragment
			if (oThat.oCapture) {
				oThat.oCapture.close();
			}
		},


		_checkAttachments: function (bCheckFourth) {
			var oThat = this;
			var oMassModel = oThat.getView().getModel("MASS");

			// If model undefined or empty → error
			if (!oMassModel || !oMassModel.getData() || oMassModel.getData().length === 0) {
			var	vErrMsg =  oThat.getView().getModel("i18n").getResourceBundle().getText("AttachmentsError1") 
				sap.m.MessageBox.error(vErrMsg);
				return false;
			}

			var aDocs = oMassModel.getData(); // uploaded docs
			var aRequired = ["TI", "TNP", "SP"]; // base required docs

			// Check base 3
			var bAllUploaded = aRequired.every(function (sType) {
				return aDocs.some(function (oDoc) {
					return oDoc.Doknr === sType;
				});
			});

			if (!bAllUploaded) {
				var	vErrMsg =  oThat.getView().getModel("i18n").getResourceBundle().getText("AttachmentsError1") 	
				sap.m.MessageToast.show(vErrMsg);
				return false;
			}

			// 🔹 Extra check only on Submit
			if (bCheckFourth) {
				var sFourth = "CP"; // 4th required attachment type
				var bExtraUploaded = aDocs.some(function (oDoc) {
					return oDoc.Doknr === sFourth;
				});

				if (!bExtraUploaded) {
						var	vErrMsg =  oThat.getView().getModel("i18n").getResourceBundle().getText("AttachmentsError2") 
					sap.m.MessageBox.error(vErrMsg);
					//sap.m.MessageToast.show(vErrMsg);
					return false;
				}
			}

			return true; // ✅ everything ok
		},



			fnf4Lgort: function () {
			if (!this.f4Lgort) {
				this.f4Lgort = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.StorageLocation", this);
				this.getView().addDependent(this.f4Lgort);
			}
			this.f4Lgort.open();
			this.fnf4LgortLoad();
		},

		fnf4LgortLoad :function(oEvent){
			var oModel = this.getOwnerComponent().getModel();
			busyDialog.open();
			if(this.Key === "INT"){
			var oOMatnr = 	oThat.getView().getModel("REZIntModel").getData().Matnr
			}
			else{
			var oOMatnr = 	oThat.getView().getModel("REZExtModel").getData().Matnr
			}
			oModel.read("/F4StorageLocSet", {
				filters: [
					new Filter("Material", FilterOperator.EQ, oOMatnr),
					new Filter("Plant", FilterOperator.EQ, this.Werks),
					
				],
				// urlParameters: {
				// 	$expand: "F4MaterialNav"
				// },

				success: function (oData, oResponse) {
					var oJSONModelLgort = new sap.ui.model.json.JSONModel();
					oJSONModelLgort.setData(oData.results);
					that.getView().setModel(oJSONModelLgort, "JMLgort");

					busyDialog.close();
				},
				error: function (oError) {
					busyDialog.close();
					MessageBox.error(oError.responseText);
				}
			});

		},
			fnFilterLgort: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Sloc", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},

		fn_ConfirmLgort: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (this.Key == "EXT") {
				// self.getView().getModel("REZExtModel").getData().Lgort= oSelectedItem.getTitle();
				// self.getView().getModel("REZExtModel").getData().Description= oSelectedItem.getDescription();
				self.getView().getModel("REZExtModel").getData().Lgort= oSelectedItem.getTitle();
				self.getView().getModel("REZExtModel").getData().Description= oSelectedItem.getIntro();
				//end
				
				self.getView().getModel("REZExtModel").refresh(true);
			} else {
				self.getView().getModel("REZIntModel").getData().Lgort = oSelectedItem.getTitle();
				self.getView().getModel("REZIntModel").getData().Description= oSelectedItem.getIntro();	
				self.getView().getModel("REZIntModel").refresh(true);
			}
		},




fnHandleMaterial: function () {
			var that = this;
			var vSelPlant = that.Werks;
			// var vSelDate = sap.ui.getCore().byId('id_SelectedDate').getValue();
			var vSelDate = sap.ui.getCore().byId('id_SelectedDate').getValue();
			if (vSelDate) {
				if (!this.oMaterialPrintDialog) {
					this.oMaterialPrintDialog = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.MaterialPrint", this);
					this.getView().addDependent(this.oMaterialPrintDialog);
				}
				this.oMaterialPrintDialog.open();
				busyDialog.open();
				var oJSONModelSize = new sap.ui.model.json.JSONModel();
				oJSONModelSize.setData([]);
				that.getView().setModel(oJSONModelSize, "JMMaterialRez");
				var oModel = this.getView().getModel();

				oModel.read("/F4MatDocSet", {
					filters: [
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSelPlant),
						new sap.ui.model.Filter("PostDate", FilterOperator.EQ, vSelDate)
					],
					// urlParameters: {
					// 	$expand: "F4ReservationNav,F4ReturnNav"
					// },
					async: true,
					success: function (oData, oResponse) {
						busyDialog.close();
						var oJSONModelSize = new sap.ui.model.json.JSONModel();
						oJSONModelSize.setData(oData.results);
						that.getView().setModel(oJSONModelSize, "JMMaterialRez");
						if (oData.results.length === 0) {
							sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("NoMaterial")) + " " + vSelPlant);
						}
					},
					error: function (oResponse) {
						busyDialog.close();
						sap.m.MessageToast.show(oResponse.message);
					}
				});
			} else {
				sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("SelectDate"));
			}
		},



	
		fnFilterMaterialRez: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Matno", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				// var oFilter3 = new sap.ui.model.Filter("Sgtxt", sap.ui.model.FilterOperator.Contains, vValue);
				// var oFilter4 = new sap.ui.model.Filter("Rspos", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},	

			fn_ConfirmMaterialRez: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			sap.ui.getCore().byId('id_ReprintMaterial').setValue(oSelectedItem.getAttributes()[0].getText());
			// sap.ui.getCore().byId('id_Item').setValue(oSelectedItem.getFirstStatus().getText());
			// sap.ui.getCore().byId('id_ReprintVehNo').setValue(oSelectedItem.getInfo());
		},





		// ended by srinivas

		//added by Laxmikanth
		onCompVehicleSelect: function(oEvent){
			this.onClearFileds();
			if(that.Issuer === 'X'){
				//this.getView().getModel("REZIntModel").getData().OwnerShip = oEvent.getSource().getText();
				this.getView().getModel("REZIntModel").getData().OwnerShip = "X";
				this.getView().getModel("localModel").setProperty("/showFuelFields", true);
			}else{
			this.getView().getModel("localModel").setProperty("/showFuelFields", false);
			//this.getView().getModel("REZIntModel").getData().OwnerShip = oEvent.getSource().getText();
			this.getView().getModel("REZIntModel").getData().OwnerShip = "X";
			this.getView().getModel("JMInt").getData().VEHNO_HELP = true;
			this.getView().getModel("JMInt").getData().DNAME_DISP = false;
			this.getView().getModel("JMInt").getData().DNAME_HELP = true;
			this.getView().getModel("JMInt").getData().DNAME_NAME = "Employee Name";
			this.getView().getModel("JMInt").getData().VEHTYP_DISP = false;
			this.getView().getModel("JMInt").getData().KOSTL = false;
			this.getView().getModel("JMInt").getData().KOSTL_DISP = false;
			this.getView().getModel("JMInt").refresh(true);
			}
			this.getView().getModel("JMInt").refresh(true);
		},
		onNonCompVehicleSelect: function(oEvent){
			this.onClearFileds();
			if(that.Issuer === 'X'){
				//this.getView().getModel("REZIntModel").getData().OwnerShip = oEvent.getSource().getText();
				this.getView().getModel("REZIntModel").getData().OwnerShip = "";
				this.getView().getModel("localModel").setProperty("/showFuelFields", true);
			}else{
			this.getView().getModel("localModel").setProperty("/showFuelFields", false);
			//this.getView().getModel("REZIntModel").getData().OwnerShip = oEvent.getSource().getText();
			this.getView().getModel("REZIntModel").getData().OwnerShip = "";
			this.getView().getModel("JMInt").getData().VEHNO_HELP = false;
			this.getView().getModel("JMInt").getData().DNAME_DISP = true;
			this.getView().getModel("JMInt").getData().DNAME_NAME = "Driver Name";
			this.getView().getModel("JMInt").getData().DNAME_HELP = false;
			this.getView().getModel("JMInt").getData().VEHTYP_DISP = true;
			this.getView().getModel("JMInt").getData().KOSTL_DISP = true;
			this.getView().getModel("JMInt").getData().KOSTL = true;
			this.getView().getModel("JMInt").refresh(true);
			}
			this.getView().getModel("JMInt").refresh(true);
		},
		onClearFileds: function(oEvent){
			this.getView().getModel("REZIntModel").getData().Vehno = "";
			this.getView().getModel("REZIntModel").getData().Dname = "";
			this.getView().getModel("REZIntModel").getData().vVehTyp = "";
			this.getView().getModel("REZIntModel").getData().Vehtyp = "";
			this.getView().getModel("REZIntModel").getData().Lgort = "";
			this.getView().getModel("REZIntModel").getData().Description = "";
			this.getView().getModel("REZIntModel").getData().Matnr = "";
			this.getView().getModel("REZIntModel").getData().Kostl = "";
			this.getView().getModel("REZIntModel").getData().saknr = "";
			this.getView().getModel("REZIntModel").getData().Wbid = "";
			//this.getView().getModel("REZIntModel").getData().Erfme = "";
			this.getView().getModel("REZIntModel").getData().Maktx = "";
			this.getView().getModel("REZIntModel").getData().Erfmg = "";
			this.getView().getModel("REZIntModel").refresh(true);
		},
		fnf4SpecialGLIndicator: function(oEvent){

			if (!this.oGLSpecialIndecator) {
				this.oGLSpecialIndecator = sap.ui.xmlfragment("ZGT_MM_REZ.fragments.GLSpecialIndecator", this);
				this.getView().addDependent(this.oGLSpecialIndecator);
			}
			this.oGLSpecialIndecator.open();
			this.fnLoadoGLSpecialIndecator();

		},

		fnLoadoGLSpecialIndecator: function(oEvent){
			//var that = this;
			var oModel = this.getOwnerComponent().getModel();
			busyDialog.open();
			oModel.read("/F4GLSet",{ 
				filters: [
						new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.Werks),
						new sap.ui.model.Filter("Prtyp", sap.ui.model.FilterOperator.EQ, this.Key)
					],
					success: function(oData, oResponse){
						var oJsonModelJMSGLIndecator = new sap.ui.model.json.JSONModel();
					oJsonModelJMSGLIndecator.setData(oData.results);
					this.getView().setModel(oJsonModelJMSGLIndecator, "JMSGLIndecator");

					busyDialog.close();
					}.bind(this),error: function(oResponse){
						busyDialog.close();
						sap.m.MessageBox.error(oResponse.message);
					}.bind(this)
			});	
		},
		fnSGLIndecator: function(oEvent){
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Sgl", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},
		fnSGLIndecatorConfirm: function(oEvent){
			var oItem = oEvent.getParameter("selectedItem");
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (this.Key == "EXT") {
				self.getView().getModel("REZExtModel").getData().umskz = oSelectedItem.getTitle();
				self.getView().getModel("REZExtModel").getData().Sgl = oSelectedItem.getDescription();
				self.getView().getModel("REZExtModel").refresh(true);
			} 
			
		},
		fnSGLIndecatorCancel: function(oEvent){
			this.oGLSpecialIndecator.close();
		},
		onScanQRValueIntIssuer: function(oEvent){
			var that = this;
			sap.ndc.BarcodeScanner.scan(
				function(mResult){
					if (!mResult.cancelled) {
						var sWBID = mResult.text.trim();
						that._validateScannedWB(sWBID);
					}else {
						that.BusyDialog.close();
						sap.m.MessageToast.show("Scanning stopped.");
					}
				},
				function (Error) {
					sap.m.MessageBox.error("Scanning failed: " + Error);
				},
				function (mParams) {
					//alert("Value entered: " + mParams.newValue);
				},
				"Enter Weibridge Number",
				true,
				30,
				1,
				false,
				false
			);
		},

		// Validate scanned wbid
		_validateScannedWB: function (sWBID) {
			var oModel = this.getOwnerComponent().getModel();

			oModel.read("/PostInputSet",{ 
				filters: [
						new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, sWBID),
						new sap.ui.model.Filter("Prtyp", sap.ui.model.FilterOperator.EQ, that.Key)
					],
					urlParameters: {
						$expand: "PostReturnNav"
					},
					success: function(oData, oResponse){
						if(oData.results[0].PostReturnNav.results.length > 0){
							sap.m.MessageBox.error(oData.results[0].PostReturnNav.results[0].Message);
						}else{
							if(that.Key === "EXT"){
								that.getView().getModel("REZExtModel").getData();
								that.getView().getModel("REZExtModel").setData(oData.results[0]);
								that.getView().getModel("REZExtModel").getData().Lgort = oData.results[0].Sloc;
								that.getView().getModel("REZExtModel").getData().Description = oData.results[0].SlocDes;
								that.getView().getModel("REZExtModel").getData().Maktx = oData.results[0].MatDes;
								that.getView().getModel("REZExtModel").getData().Litxt = oData.results[0].TransDes;
								that.getView().getModel("REZExtModel").getData().umskz = oData.results[0].SplGL;
								that.getView().getModel("REZExtModel").getData().netpr = oData.results[0].UnitPrice;
								that.getView().getModel("REZExtModel").getData().MaxLiters = parseFloat(oData.results[0].Erfmg).toString();
								that.getView().getModel("REZExtModel").refresh(true);
							}else{
								that.getView().getModel("REZIntModel").getData();
								that.getView().getModel("REZIntModel").setData(oData.results[0]);
								that.getView().getModel("REZIntModel").getData().Lgort = oData.results[0].Sloc;
								that.getView().getModel("REZIntModel").getData().Description = oData.results[0].SlocDes;
								that.getView().getModel("REZIntModel").getData().Maktx = oData.results[0].MatDes;
								that.getView().getModel("REZIntModel").getData().saknr = oData.results[0].SplGL
								that.getView().getModel("REZIntModel").getData().MaxLiters = parseFloat(oData.results[0].Erfmg).toString();
								if(oData.results[0].OwnerShip === 'X'){
									that.getView().byId("id_compVehicleRadioBtn").setSelected(true);
									that.getView().byId("id_compVehicleRadioBtn").setEditable(false);
									that.getView().byId("id_NoncompVehicleRadioBtn").setEditable(false);
									that.getView().getModel("JMInt").getData().COMVEH_DISP = false;
									that.getView().getModel("JMInt").getData().NCOMVEH_DISP = false;
									that.getView().getModel("JMInt").getData().KOSTL = false;
								}else{
									that.getView().byId("id_NoncompVehicleRadioBtn").setSelected(true);
									that.getView().byId("id_compVehicleRadioBtn").setEditable(false);
									that.getView().byId("id_NoncompVehicleRadioBtn").setEditable(false);
									that.getView().getModel("JMInt").getData().COMVEH_DISP = false;
									that.getView().getModel("JMInt").getData().NCOMVEH_DISP = false;
									that.getView().getModel("JMInt").getData().KOSTL = true;
								}
								that.getView().getModel("JMInt").refresh(true);
								that.getView().getModel("REZIntModel").refresh(true);
							}
						}
					},error: function(oResponse){
						sap.m.MessageBox.error(oResponse.message);
					}
			});			
		}


	});

});