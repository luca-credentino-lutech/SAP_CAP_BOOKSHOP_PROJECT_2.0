
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

            if (!this.AggiungiLibroFragment) {
                this.AggiungiLibroFragment = Fragment.load({
                    id: oView.getId(),
                    name: "bookshop.fragment.AggiungiLibro",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.AggiungiLibroFragment.then((oDialog) => {
                oDialog.open();
            });
        },

        ApriModificaLibro() {
            const oView = this.getView();

            if (!this.ModificaLibroDialog) {
                this.ModificaLibroDialog = Fragment.load({
                    id: oView.getId(),
                    name: "bookshop.fragment.ModificaLibro",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            return this.ModificaLibroDialog;
        },


        onChiudi() {
            this.byId("aggiungiLibroID").close();
        },
        onChiudi2() {
            this.byId("modificaLibroDialog").close();
        },

        async onSalvaLibro() {
            debugger
            const sGenere = this.byId("InputGenere")
            const sTitolo = this.byId("InputTitolo");
            const sAutore = this.byId("InputAutore");
            const sDescrizione = this.byId("InputDescr");
            const iStock = this.byId("InputStock");
            const dPrezzo = this.byId("InputPrezzo");
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
                prezzo: dPrezzo.getValue(),
                autore_ID: sAutoreID
            };

            for (const i of aTuttiIcampi) {
                if (i.getValue() == "") {
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

       async eliminaLibro(oEvent) {

             const oContext = oEvent.getSource().getBindingContext();

            const oLibroDati = oContext.getObject();

           try{ const oRisposta = await fetch("/odata/v4/admin/eliminaRecord", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oLibroDati.ID)
            });
            console.log(oRisposta.body)
            const oModel = this.getView().getModel()
            oModel.refresh()
            MessageToast.show("Record Eliminato correttamente")
        }catch(error){
            console.log(error)
        }
        },

        async modificaLibro(oEvent) {

            const oContext = oEvent.getSource().getBindingContext();

            const oLibroDati = oContext.getObject();

            console.log("Libro selezionato:", oLibroDati);

            this._oLibroSelezionato = oLibroDati;

            const oDialog = await this.ApriModificaLibro();

            this.byId("InputID").setValue(oLibroDati.ID)
            this.byId("InputGenere2").setValue(oLibroDati.genere);
            this.byId("InputTitolo2").setValue(oLibroDati.titolo);
            this.byId("InputDescr2").setValue(oLibroDati.descrizione);
            this.byId("InputStock2").setValue(oLibroDati.stock);
            this.byId("InputPrezzo2").setValue(oLibroDati.prezzo);
            this.byId("InputAutore2").setValue(oLibroDati.autore.nome);
            this.byId("InputAutoreID").setValue(oLibroDati.autore.ID)

            oDialog.open();

            return oLibroDati;

        },

        async onModificaLibro() {
            const ID = this.byId("InputID")
            const sGenere = this.byId("InputGenere2")
            const sTitolo = this.byId("InputTitolo2");
            const sAutore = this.byId("InputAutore2");
            const sDescrizione = this.byId("InputDescr2");
            const iStock = this.byId("InputStock2");
            const dPrezzo = this.byId("InputPrezzo2");
            const sAutoreID = this.byId("InputAutoreID")

            const oPayloadLibroAggiornato = {
                ID: ID.getValue(),
                titolo: sTitolo.getValue(),
                autore: sAutore.getValue(),
                descrizione: sDescrizione.getValue(),
                genere: sGenere.getValue(),
                stock: iStock.getValue(),
                prezzo: dPrezzo.getValue(),
                autore_ID: sAutoreID.getValue()

            }

            const oRisposta = await fetch("/odata/v4/admin/updateLibro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oPayloadLibroAggiornato)
            });
            let oLibroAggiornato = await oRisposta.json();
            const oModel = this.getView().getModel()
            oModel.refresh()
            MessageToast.show("Libro aggiornato correttamente")
            this.onChiudi2()
        }
    },
    );
});