sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, MessageToast, MessageBox, Fragment) => {
    "use strict";

    return Controller.extend("bookshop.controller.UserView", {
        onInit() {
            debugger
 
        },
        // async onSelectionChangeLibro() {
        //     debugger
        //     let oTable = this.byId("tableUser")
        //     var aItems = oTable.getItems();
        //     var oCheckBox = oItem.getMode().getSelector();
        //     oItem.setEnabled(false);
        //     try {
        //         let oRisposta = await fetch("/odata/v4/user/Libri", {
        //             method: "GET"
        //         });
        //         debugger
        //         let oRispostaJSON = await oRisposta.json();
        //         let stock = oRispostaJSON.value.map(i => (i.stock == 0))
        //         for (const singoloStock of stock) {
        //             if (singoloStock == 0) {

        //             }
        //         }
        //         let oModel = this.getView().getModel();

        //         oModel.refresh()

        //     } catch (oError) {
        //         console.log(oError);
        //     }
        // },

        onSelectionChangeLibro: function (oEvent) {
            const oTable = this.byId("tableUser");
            const oItem = oEvent.getParameter("listItem");
            const oLibro = oItem.getBindingContext().getObject();

            if (oLibro.stock === 0) {
                oTable.setSelectedItem(oItem, false);
                MessageToast.show(`${oLibro.titolo} non è presente in magazzino al momento`);
                return;
            }

        },

        InserisciCarrello() {
            const oTable = this.byId("tableUser");
            const aLibriSelezionati = oTable.getSelectedItems().map(oItem => {
                const oCarrelloLibri = oItem.getBindingContext().getObject()

                return {

                    ID: oCarrelloLibri.ID,
                    titolo: oCarrelloLibri.titolo,
                    descrizione: oCarrelloLibri.descrizione,
                    quantita: 1


                }
            }
            )

            const oModelCarrello = new JSONModel({
                items: aLibriSelezionati
            });


            this.ApriCarrello(oModelCarrello);
        },
        onChiudiCarrello() {
            this.byId("carrelloDialog").close();
        },

        ApriCarrello(oModelCarrello) {
            const oView = this.getView();
            oView.setModel(oModelCarrello, "CarrelloLibri")
            if (!this.Carrello) {
                this.Carrello = Fragment.load({
                    id: oView.getId(),
                    name: "bookshop.fragment.Carrello",
                    controller: this
                }).then((oDialog) => {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.Carrello.then((oDialog) => {
                oDialog.open();
            });
        },

        onAcquistaCarrello(oEvent){

        const oModel = this.getView().getModel("CarrelloLibri");
        const oLibri = oModel.getData().items
        // oLibri.map(i => {
        //     this.AcquistaFetch(i.ID, i.quantita)
        // })
          
        },

        onItemActionPress(oEvent) {
            const oModel = this.getView().getModel("CarrelloLibri");

            const oItem = oEvent.getParameter("listItem");

            const oAction = oEvent.getParameter("action");

            const oContext = oItem.getBindingContext("CarrelloLibri");

            const sPath = oContext.getPath();

            const iQuantitaAttuale = oModel.getProperty(sPath + "/quantita");


            if (oAction.getText() == "Aggiungi") {
                oModel.setProperty(sPath + "/quantita", iQuantitaAttuale + 1);
            }

            if (oAction.getText() == "Leva") {
                const iNuovaQuantita = iQuantitaAttuale - 1;
                oModel.setProperty(sPath + "/quantita", iNuovaQuantita);

                if(iNuovaQuantita == 0){
                    oItem.mProperties = {}
                }
                
            }
        },
        async AcquistaLibro() {
            const oTable = this.byId("tableUser");
            const aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.error("Nessun libro selezionato");
                return;
            }

            const aLibri = aSelectedItems.map(oItem =>
                oItem.getBindingContext().getObject()
            );

            const aDisponibili = aLibri.filter(libro => libro.stock > 0);
            const aNonDisponibili = aLibri.filter(libro => libro.stock === 0);
            const sTitoliDisponibili = aDisponibili.map(elem => { return elem.titolo })
            const sTitoloNonDisponibili = aNonDisponibili.map(elem => { return elem.titolo })

            if (aDisponibili.length === 0) {
                MessageBox.warning(`Il Libro/i: ${sTitoloNonDisponibili}, non sono disponibili, mi spiace `);
                return;
            }


            if (aNonDisponibili.length > 0) {

                MessageBox.warning(`Solo ${sTitoliDisponibili} è/sono disponibili, seleziona solo quello/i disponbili`);
            }

            if (aDisponibili.length > 0 && aNonDisponibili.length === 0) {

                for (const SingoloLibro of aDisponibili) {
                    await this.AcquistaFetch(
                        SingoloLibro.ID,
                        Number(SingoloLibro.stock) - 1
                    );
                }

                this.getView().getModel().refresh();
                MessageBox.success(`Hai acquistato ${sTitoliDisponibili}`);

            }
        },

        async AcquistaFetch(ID, Stock) {
            let oPayloadStock = {
                ID: ID,
                stock: Stock
            };
            try {
                let oRisposta = await fetch("/odata/v4/user/aggiornaStock", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(oPayloadStock)
                });
                let oLibroAggiornato = await oRisposta.json();
                let oModel = this.getView().getModel();

                oModel.refresh()

            } catch (oError) {
                console.log(oError);
            }
        },

    });
});