sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/base/util/uid",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, Fragment, uid, MessageToast, MessageBox) => {
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
            debugger
            const sGenere = this.byId("InputGenere")
            const sTitolo = this.byId("InputTitolo");
            const sAutore = this.byId("InputAutore");
            const sDescrizione = this.byId("InputDescr");
            const iStock = this.byId("InputStock");
            const fPrezzo = this.byId("InputPrezzo");
            const aTuttiIcampi = [sTitolo, sAutore, sDescrizione, iStock, fPrezzo];
            const sAutoreID = crypto.randomUUID();

            const oPayloadAutore = {
                ID: sAutoreID,
                nome: sAutore.getValue()
            };

            const oPayloadLibro = {
                titolo: sTitolo.getValue(),
                descrizione: sDescrizione.getValue(),
                genere: sGenere.getValue(),
                stock: iStock.getValue(),
                prezzo: fPrezzo.getValue(),
                autore_ID: sAutoreID
            };

            for(const i of aTuttiIcampi){
                if(i.getValue() == ""){
                    MessageBox.error("Compila tutti i campi obbligatori!");
                    return;
                }
            }

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
                 aTuttiIcampi.forEach(elem => elem.setValue(""))
                this.byId("aggiungiLibroID").close();

            } catch (oError) {
                console.error(oError);
            }
        },

        eliminaLibro(oEvent){

            

        },

        modificaLibro(oEvent){

        },

    },
    );
});