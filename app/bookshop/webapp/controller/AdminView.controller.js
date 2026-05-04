sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/base/util/uid",
    "sap/m/MessageToast"
], (Controller, JSONModel, Fragment, uid, MessageToast) => {
    "use strict";

    return Controller.extend("bookshop.controller.AdminView", {
        onInit() {

        },
        onLogOff() {

            localStorage.clear();
            sessionStorage.clear()
            this.getOwnerComponent().getRouter().navTo("RouteView1");

        },

        ApriAggiungiLibro() {
            const oView = this.getView();

            if (!this.AggiungiLibroDialog) {
                this.AggiungiLibroDialog = Fragment.load({
                    id: oView.getId(),
                    name: "bookshop.webapp.fragment.AggiungiLibro",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.AggiungiLibroDialog.then((oDialog) => {
                oDialog.open();
            });
        },
        

        onChiudi() {
            this.byId("aggiungiLibroID").close();
        },

        async onSalvaLibro() {
            const sTitolo = this.byId("InputTitolo").getValue();
            const sAutore = this.byId("InputAutore").getValue();
            const sDescrizione = this.byId("InputDescr").getValue();
            const iStock = this.byId("InputStock").getValue();
            const fPrezzo = this.byId("InputPrezzo").getValue();

            const sAutoreID = crypto.randomUUID();

            const oPayloadAutore = {
                ID: sAutoreID,
                nome: sAutore
            };

            const oPayloadLibro = {
                titolo: sTitolo,
                descrizione: sDescrizione,
                stock: iStock,
                prezzo: fPrezzo,
                autore_ID: sAutoreID
            };

            try {
                const oResponseAutore = await fetch("/odata/v4/admin/aggiungiAutore", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(oPayloadAutore)
                });

                const oResponseLibro = await fetch("/odata/v4/admin/aggiungiLibro", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(oPayloadLibro)
                });


                MessageToast.show("Libro aggiunto correttamente");
                 const oModel = this.getView().getModel()
                 oModel.refresh()
                this.byId("aggiungiLibroID").close();

            } catch (oError) {
                console.error(oError);
            }
        },
    },
    );
});