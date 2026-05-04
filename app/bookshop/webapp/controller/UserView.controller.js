sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("bookshop.controller.UserView", {
        onInit() {


        },

        onLogOff() {
            localStorage.clear();
            sessionStorage.clear()
            this.getOwnerComponent().getRouter().navTo("RouteView1");

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
            const sTitoliDisponibili = aDisponibili.map(elem => { return elem.titolo})
            const sTitoloNonDisponibili = aNonDisponibili.map(elem => { return elem.titolo})

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
                MessageBox.success(`Hai acquistato ${sTitoliDisponibili} libro/i`);

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