sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("bookshop.controller.UserView", {
        onInit() {
        },

        onLogOff() {
            localStorage.clear();
            sessionStorage.clear()
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },
        async AcquistaLibro(oEvent) {
            debugger;
            const oData = oEvent.getSource().getBindingContext().getObject()
            let iStock = oData.stock
            let sID = oData.ID

            if (iStock != 0) {
                iStock = iStock - 1
            } else {
                var oButton = oEvent.getSource();
                oButton.setEnabled(false);
            }

            const oPayloadStock = {
                ID: sID,
                stock: iStock
            };

            try {
                const oRisposta = await fetch("/odata/v4/user/aggiornaStock", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(oPayloadStock)
                });
                const oLibroAggiornato = await oRisposta.json();
                const oModel = this.getView().getModel();
                oModel.refresh()
                MessageToast.show("Acquistato");

            } catch (oError) {
                console.error(oError);
            }
        }

    });
});