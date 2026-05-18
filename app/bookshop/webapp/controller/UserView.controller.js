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

        async AcquistaLibro() {
            const that = this
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
            const sID = aDisponibili.map(elem => { return elem.ID })
            const nPrezzo = aDisponibili.map(elem => { return elem.prezzo })
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
                    MessageBox.success(`Hai acquistato ${sTitoliDisponibili}, vuoi richiedere la fattura?`, {
                        title: "Acquista Libro",
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,

                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                that.AcquistaFetch(
                                    SingoloLibro.ID,
                                    SingoloLibro.stock - 1
                                );
                                that.inviaProdottoAIntegrationSuite(sID[0], nPrezzo[0])

                            } else {
                                that.AcquistaFetch(
                                    SingoloLibro.ID,
                                    SingoloLibro.stock - 1
                                );
                            }
                        }
                    }
                    )
                }

                this.getView().getModel().refresh();

            }
            oTable.removeSelections(true)
        },

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
            debugger;
            const oTable = this.byId("tableUser");
            const oModel = this.getView().getModel("CarrelloLibri")
            let aLibriSelezionati = oTable.getSelectedItems().map(oItem => {
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


        // MessageBox.success(`Hai acquistato ${sTitoliDisponibili}, vuoi richiedere la fattura?`, {
        //                 title: "Acquista Libro",
        //                 actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        //                 emphasizedAction: MessageBox.Action.OK,

        //                 onClose: function (oAction) {
        //                     if (oAction === MessageBox.Action.OK) {
        //                         that.AcquistaFetch(
        //                             SingoloLibro.ID,
        //                             SingoloLibro.stock - 1
        //                         );
        //                         that.inviaProdottoAIntegrationSuite(sID[0], nPrezzo[0])

        //                     } else {
        //                         that.AcquistaFetch(
        //                             SingoloLibro.ID,
        //                             SingoloLibro.stock - 1
        //                         );
        //                     }
        //                 }
        //             }
        //             )
        //         }

        async onAcquistaCarrello(oEvent) {
            let oRisposta = await fetch("/odata/v4/user/Libri", {
                method: "GET",

            });
            let oView = this.getView()
            let oLibriEntity = await oRisposta.json();
            let that = this
            MessageBox.success(`Vuoi richiedere la fattura?`, {
                title: "Acquista Libro",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,

                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {

                        try {

                            let iNuovaQuantita = 0

                            const oModel = oView.getModel("CarrelloLibri");

                            const oLibri = oModel.getData().items



                            oLibriEntity.value.map(items => {
                                const sIDentity = items.ID

                                const iQuantitaCorrente = items.stock
                                const nPrezzo = items.prezzo

                                oLibri.map(j => {
                                    const sIDlibroCarrello = j.ID

                                    const iQuantitaCarrello = j.quantita

                                    if (sIDlibroCarrello == sIDentity) {
                                        iNuovaQuantita = iQuantitaCorrente - iQuantitaCarrello

                                        that.AcquistaFetch(sIDlibroCarrello, iNuovaQuantita)
                                        that.inviaProdottoAIntegrationSuite(sIDlibroCarrello, nPrezzo)
                                    }

                                })

                            })
                            that.onChiudiCarrello();
                            const oTable = this.byId("tableUser");
                            oTable.removeSelections(true);
                            MessageBox.success(`Pagamento andato a buon fine!`, {

                            })

                        } catch (oError) {
                            console.log(oError);
                        }
                    } else {
                        try {

                            let iNuovaQuantita = 0

                            const oModel = oView.getModel("CarrelloLibri");

                            const oLibri = oModel.getData().items

                            oLibriEntity.value.map(items => {
                                const sIDentity = items.ID

                                const iQuantitaCorrente = items.stock


                                oLibri.map(j => {
                                    const sIDlibroCarrello = j.ID

                                    const iQuantitaCarrello = j.quantita

                                    if (sIDlibroCarrello == sIDentity) {
                                        iNuovaQuantita = iQuantitaCorrente - iQuantitaCarrello

                                        that.AcquistaFetch(sIDlibroCarrello, iNuovaQuantita)

                                    }

                                })

                            })
                            this.onChiudiCarrello();
                            const oTable = this.byId("tableUser");
                            oTable.removeSelections(true);
                            MessageBox.success(`Pagamento andato a buon fine!`, {

                            })

                        } catch (oError) {
                            console.log(oError);
                        }
                    }
                }

            })
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

                if (iNuovaQuantita == 0) {
                    oItem.mProperties = {}
                }

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
                MessageToast.show("Operazione andata buon fine");
                oModel.refresh()

            } catch (oError) {
                console.log(oError);
            }
        },

        EstraiIDSelezionati() {
            const oTable = this.byId("tableUser");
            const aSelectedItems = oTable.getSelectedItems();
            const aLibri = aSelectedItems.map(oItem =>
                oItem.getBindingContext().getObject()
            );

            for (let index = 0; index < aLibri.length; index++) {
                const ID = aLibri[index].ID;

                return ID
            }

        },

        EstraiPrezziSelezionati() {
            const oTable = this.byId("tableUser");
            const aSelectedItems = oTable.getSelectedItems();
            const aLibri = aSelectedItems.map(oItem =>
                oItem.getBindingContext().getObject()
            );

            for (let index = 0; index < aLibri.length; index++) {

                const Prezzo = aLibri[index].prezzo
                return Prezzo
            }

        },

        inviaProdottoAIntegrationSuite (ID, prezzo) {

            let datiLibro = {
                ID: ID,
                prezzo: prezzo
            };

            fetch("/odata/v4/user/richiediConfermaIS", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(datiLibro)

            })
                .then(function (response) {
                    return response.text().then(function (responseText) {
                        return {
                            status: response.status,
                            ok: response.ok,
                            body: responseText
                        };
                    });
                })
                .then(function (result) {
                    if (result.ok) {
                        MessageBox.success("Prodotto ricevuto correttamente. " + result.body);
                    } else {
                        MessageBox.error("Errore:" + result.status + result.body);
                    }
                })
                .catch(function (error) {
                    MessageBox.error("Errore chiamata:" + error.message);
                });
        },

    });
});