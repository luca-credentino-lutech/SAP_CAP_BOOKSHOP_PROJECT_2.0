sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("bookshop.controller.View1", {
        onInit() {

            debugger;
            const that = this
            
            $.ajax({ 
                // è una funzione fornita dalla libreria jQuery (inclusa nativamente in SAPUI5) 

                // utilizzata per effettuare richieste HTTP asincrone verso un server (cap)

                url: "/odata/v4/auth/getUser()",

                method: "GET",
                success: function (data) {
                    
                    console.log(data.id)
                    if (data.id === "admin") {

                        const oRouter = that.getOwnerComponent().getRouter();

                        oRouter.navTo("AdminView");
                    } else {
                        const oRouter = that.getOwnerComponent().getRouter();

                        oRouter.navTo("UserView");
                    }
                }

            });

        },

    });
});