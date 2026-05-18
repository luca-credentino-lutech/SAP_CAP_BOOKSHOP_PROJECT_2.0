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

            const oTable = this.byId("tableUser");


            let oModelCarrello = this.getView().getModel("CarrelloLibri");

            // Se non esiste crealo una volta sola
            if (!oModelCarrello) {
                oModelCarrello = new JSONModel({
                    items: []
                });
                this.getView().setModel(oModelCarrello, "CarrelloLibri");
            }


            let aItems = oModelCarrello.getProperty("/items");


            let aNuoviLibri = oTable.getSelectedItems().map(oItem => {
                const oLibro = oItem.getBindingContext().getObject();
                return {
                    ID: oLibro.ID,
                    titolo: oLibro.titolo,
                    descrizione: oLibro.descrizione,
                    stock: oLibro.stock,
                    quantita: 1
                };
            });

            // Merge con gestione duplicati
            aNuoviLibri.forEach(oNuovo => {
                const oEsistente = aItems.find(o => o.ID === oNuovo.ID);

                if (oEsistente) {
                    oEsistente.quantita++;
                } else {
                    aItems.push(oNuovo);
                }
            });

            oModelCarrello.setProperty("/items", aItems);

            this.ApriCarrello(oModelCarrello);
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

        resetModello() {

            let oModelCarrello = this.getView().getModel("CarrelloLibri");
            oModelCarrello.setProperty("/items", []);
        },


        async onAcquistaCarrello(oEvent) {
            debugger;
            let oRisposta = await fetch("/odata/v4/user/Libri", {
                method: "GET",

            });
           
            let oView = this.getView()
            let idBtnAcquistaCarrello = oView.byId("acquistaCarrello")
            let oModel = oView.getModel("CarrelloLibri");
            let oLibri = oModel.getData().items
            let oLibriEntity = await oRisposta.json();
            let that = this
            
            if (oLibri[0] === undefined) {
                MessageBox.error("Carrello Vuoto");
                return;
            }

            MessageBox.success(`Vuoi richiedere la fattura?`, {
                title: "Acquista Libro",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,

                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {

                        try {

                            let iNuovaQuantita = 0

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
                            const oTable = that.byId("tableUser");
                            oTable.removeSelections(true);
                            MessageBox.success(`Pagamento andato a buon fine!`)
                            that.resetModello()
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
                            that.onChiudiCarrello();
                            const oTable = that.byId("tableUser");
                            oTable.removeSelections(true);
                            MessageBox.success(`Pagamento andato a buon fine!`)
                            that.resetModello()

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

            const iStockAttuale = oModel.getProperty(sPath + "/stock");

            if(iStockAttuale == iQuantitaAttuale){
                MessageBox.error("Non Puoi aggiungere altri libri nel carrello");
                return;
            }
            if (oAction.getText() == "Aggiungi") {
                oModel.setProperty(sPath + "/quantita", iQuantitaAttuale + 1);
            }

            if (oAction.getText() == "Leva") {
                const iNuovaQuantita = iQuantitaAttuale - 1;
                oModel.setProperty(sPath + "/quantita", iNuovaQuantita);

                if (iNuovaQuantita == 0) {
                    oItem.mProperties = {}
                    oModel.setProperty(sPath, {})
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

        inviaProdottoAIntegrationSuite(ID, prezzo) {

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

        onChiudiCarrello() {
            this.byId("carrelloDialog").close();
        }
    });
});