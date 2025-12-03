sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "ZGT_MM_REZ/model/Formatter",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
], function (Controller,
	JSONModel,
	FilterOperator,
	Filter,
	Formatter,
	MessageBox,
    BusyDialog) {
    "use strict";
    return Controller.extend("ZGT_MM_REZ.controller.Reports", {
        onInit: function () {
            this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sValue = oArgs.sValue;
            this.oPlant = sValue;
            this.oSelectedPlant = this.getOwnerComponent().getModel("SelectedVehicleModel").getData();
            if(this.oSelectedPlant.Werks){
            if (sValue) {
                // reference to the column (2nd column = WB ID)
                var oTable = this.byId("reportsTable");
                var oColumns = oTable.getColumns();
                // assuming 2nd column is WB ID
                var oWBIdColumn = oColumns[1];
               // oWBIdColumn.setVisible(false); // hide WB ID column
            } else {
               // oWBIdColumn.setVisible(true); // show WB ID column
            }
        }else{
            this.getOwnerComponent().getRouter().navTo("Rez");
        }
        },
        onReportsBackPress: function(oEvent){
            this.getOwnerComponent().getRouter().navTo("Rez");
        },
        onFilter: function(oEvent){
            // var ofromDate = this.getView().byId("fromDate").getDateValue();
            // var oTodate = this.getView().byId("toDate").getDateValue();
             var ofromDate = this.getView().byId("toDate").getDateValue();
            var oTodate = this.getView().byId("toDate").getSecondDateValue();
            var oConsumptionType = this.getView().byId("consumptionTypeSelect").getSelectedKey();
            var oStatus = this.getView().byId("statusSelect").getSelectedKey();
            this.BusyDialog = new BusyDialog();
            if(!ofromDate){
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectFromDate"));
                return;
            }
            // if(!oTodate){
            //     sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectToDate"));
            //     return;
            // }
            var sCreationDate = ofromDate.toISOString().replace('Z','') +" "+ "and" +" "+ oTodate.toISOString().replace('Z','');
            var aURLParam = ["$filter= CreationDate ge datetime'" + this.formatLocalToCustom(ofromDate) + "' and CreationDate le datetime'" + this.formatLocalToCustom(oTodate) + "' and " + "Werks eq '" + this.oPlant + "' and  OwnerShip eq '" + oConsumptionType + "' and Status eq '" + oStatus +"'"];
            var oModel = this.getOwnerComponent().getModel("reportModel");
                //oModel.setUseBatch(false);
                 this.BusyDialog.open();
            oModel.read("/GetDiselReportSet",{
                 urlParameters: aURLParam,
                // filters: [
				// 		new sap.ui.model.Filter("CreationDate", sap.ui.model.FilterOperator.EQ, sCreationDate),
				// 		new sap.ui.model.Filter("Werks", FilterOperator.EQ, this.oPlant),
				// 		new sap.ui.model.Filter("OwnerShip", FilterOperator.EQ, oConsumptionType),
				// 		new sap.ui.model.Filter("Status", FilterOperator.EQ, oStatus)
				// 	],
					// urlParameters: {
					// 	$expand: "F4ReservationNav,F4ReturnNav"
					// },
					async: true,
                    success:function(oData,oResponse){
                         this.BusyDialog.close();
                          var oReportsModel = new JSONModel();
                        if(oData.results.length === 0){
                            sap.m.MessageToast.show("No data");
                        oReportsModel.setData(oData.results);
                        this.getView().byId("idTotalReports").setText(oData.results.length);
                        this.getView().setModel(oReportsModel,"ReportsModel");
                        this.getView().getModel("ReportsModel").refresh(true);
                            //this.onClearFilters();
                        }else{
                       
                        if(oData.results.length > 0){
                            for(var i=0; i<oData.results.length; i++){
                                oData.results[i].CreationDate = this.dateFormat(oData.results[i].CreationDate);
                                // oData.results[i].Matnr = oData.results[i].Matnr.replace(/\s+/g, '').split("-")[1] + "-" + oData.results[i].Matnr.replace(/\s+/g, '').split("-")[2];
                                // oData.results[i].Lifnr = oData.results[i].Lifnr.replace(/^0+/, '');
                            }
                        oReportsModel.setData(oData.results);
                        this.getView().byId("idTotalReports").setText(oData.results.length);
                        this.getView().setModel(oReportsModel,"ReportsModel");
                        this.getView().getModel("ReportsModel").refresh(true);
                        }
                        }
                    }.bind(this),
                    error:function(oResponse){
                           this.BusyDialog.close();
                        MessageBox.error(oResponse.message);
                    }.bind(this)
            })

            
        },
        onSearch: function (oEvent) {
            // add filter for search
            this.BusyDialog = new BusyDialog();
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            this.BusyDialog.open();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("Wbid", FilterOperator.Contains, sQuery);
                var oFilter1 = new Filter("ResNo", FilterOperator.Contains, sQuery);
                var oFilter2 = new Filter("Lifnr", FilterOperator.Contains, sQuery);
                var oFilter3 = new Filter("OwnerShip", FilterOperator.Contains, sQuery);
                var oFilter4 = new Filter("Status", FilterOperator.Contains, sQuery);
                var oFilter6 = new Filter("Matnr", FilterOperator.Contains, sQuery);
                 var oFilter7 = new Filter("Direction", FilterOperator.Contains, sQuery);
                var oFilter5 = new sap.ui.model.Filter([filter, oFilter1,oFilter2,oFilter3,oFilter4,oFilter6,oFilter7], false);

                aFilters.push(oFilter5);
            }
            // update list binding
            var oList = this.byId("reportsTable");
            var oBinding = oList.getBinding("items");
            if(oBinding){
                oBinding.filter(aFilters, "Application");
                this.getView().byId("idTotalReports").setText(oBinding.iLength);
                this.BusyDialog.close();
            }else{
                sap.m.MessageToast.show("No data available in Table \n\n Please load the table Data...");
                 this.BusyDialog.close();
                return;
            }
           
        },
        dateFormat: function (sdate) {

            var oDateValue = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd-MMM-YYYY" });
                return oDateValue.format(sdate);
        },
        // Date converter
        formatLocalToCustom: function (date) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mi = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');

            return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.000`;
        },
         // filters clear Button
        onClearFilters: function () {
            this.byId("fromDate").setValue("");
            this.byId("toDate").setValue("");
            this.byId("consumptionTypeSelect").setValue('');
             this.byId("consumptionTypeSelect").setSelectedKey('');
            this.byId("statusSelect").setValue('');
            this.byId("statusSelect").setSelectedKey('');
        },
		onDownloadReports: function(oEvent){

            // Convert JSON to CSV
            var csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Reservation No.,Creation Date,Consumption Type,Material Description,Quantity,UoM,WB ID,Transporter,Vehicle No.,Vehicle OwnerShip,Status\n"; // Header row

            // aData.forEach(function(row) {
            //     csvContent1 += row.Name + "," + row.Age + "," + row.City + "\n";
            // });
            if (this.getView().getModel("ReportsModel")) {
                // //start the logic for downloading search data only
                // // if only selected data should download from table like after search the data only need to download than below logic should implement
                // var aSearchedData = [];
                // for (var l = 0; l < this.getView().byId("reportsTable").getBinding('items').iLength; l++) {
                //     aSearchedData.push(JSON.parse(this.getView().byId("reportsTable").getBinding('items').getContextData(this.getView().byId("reportsTable").getBinding('items').getAllCurrentContexts()[l])));
                // }
                // this.getView().getModel("ReportsModel").setData(aSearchedData);
                // //end the logic for downloading search data only
                this.getView().getModel("ReportsModel").getData().forEach(function (rows) {
                    csvContent += rows.ResNo + "," + rows.CreationDate + "," + rows.Direction + "," + rows.Matnr + "," + rows.Erfmg + "," + rows.Erfme + "," + rows.Wbid + "," + rows.Lifnr + "," + rows.Vehno + "," + rows.OwnerShip + "," + rows.Status + "\n";
                })
                // Create a download link and trigger the download
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "FuelConsumptionReports.csv");
                document.body.appendChild(link); // Required for FF

                link.click(); // This will download the data file named "data.csv"
                document.body.removeChild(link); // Clean up
            } else {
                sap.m.MessageToast.show("No Data...");
            }
		}


    })
});