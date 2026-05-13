const cds = require('@sap/cds');
const { UPDATE, DELETE } = require('@sap/cds/lib/ql/cds-ql');


module.exports = cds.service.impl(async function () {

    this.on('getUser', req => {
        return {
            id: req.user.id,
            // password: req.user.password,
            // role: req.user.roles

        }
    })


    const { Libri, Autore } = this.entities;

    this.on("aggiungiLibro", async (req) => {
        try {
            const dati = req.data;

            const nuovoLibro = {
                ID: cds.utils.uuid(),
                titolo: dati.titolo,
                descrizione: dati.descrizione,
                genere: dati.genere,
                stock: Number(dati.stock),
                prezzo: Number(dati.prezzo),
                autore_ID: dati.autore_ID
            };

            await INSERT.into(Libri).entries(nuovoLibro);

            return nuovoLibro;

        } catch (err) {
            console.log(err);
            return req.error(500, err.message);
        }
    });

    this.on("updateLibro", async (req) => {

        try {
            const dati = req.data;

            const nuovoLibro = {
                ID: dati.ID,
                titolo: dati.titolo,
                descrizione: dati.descrizione,
                genere: dati.genere,
                stock: Number(dati.stock),
                prezzo: Number(dati.prezzo),
                autore_ID: dati.autore_ID
            };

            await UPDATE(Libri).set(nuovoLibro)
                .where({
                    ID: dati.ID
                });


            const libroAggiornato = await SELECT.one
                .from(Libri)
                .where({ ID: dati.ID });

            return libroAggiornato;

        } catch (err) {
            console.log(err);
            return req.error(500, err.message);
        }
    });

    this.on("aggiungiAutore", async (req) => {
        try {
            const dati = req.data;

            const nuovoAutore = {
                ID: dati.ID,
                nome: dati.nome
            };

            await INSERT.into(Autore).entries(nuovoAutore);

            return nuovoAutore;

        } catch (err) {
            console.log(err);
            return req.error(500, err.message);
        }
    });

    this.on("aggiornaStock", async (req) => {
        try {
            const dati = req.data;


            await UPDATE(Libri).set({ stock: dati.stock })
                .where({
                    ID: dati.ID
                });


            const libroAggiornato = await SELECT.one
                .from(Libri)
                .where({ ID: dati.ID });

            return libroAggiornato;


        } catch (err) {
            console.log(err);
            return req.error(500, err.message);
        }
    })

    this.on("eliminaRecord", async (req) => {
        try {
            const dati = req.data;

            await DELETE.from(Libri)
                .where({
                    ID: dati.ID,
                });


            const tabAggiornato = await SELECT.one
                .from(Libri)
                .where({ ID: dati.ID });

            return tabAggiornato;


        } catch (err) {
            return req.error(500, err.message);
        }
    })

   

        this.on("richiediConfermaIS", async function (req) {
            try {
                const tokenUrl = "https://9ba026b1trial.authentication.us10.hana.ondemand.com/oauth/token";

                const clientId = "sb-5fe5b236-9637-47e6-bdb0-dcbe10cbf526!b646593|it-rt-9ba026b1trial!b26655";
                const clientSecret = "9e3fb7fe-2350-44d3-a6fc-6bb9465ee490$JF2nPHgQfXKCOeo0v-yAYs5c7Zq5g2NBUCi2ctCXGtA=";

                const endpointUrl = "https://9ba026b1trial.it-cpitrial05-rt.cfapps.us10-001.hana.ondemand.com/http/ordine_libri/conferma-js";

                const ID = req.data.ID;
                const prezzo = req.data.prezzo;

                if (!ID || prezzo === undefined) {
                    return req.error(400, "Campi obbligatori mancanti: ID e prezzo");
                }

                const credenziali = Buffer
                    .from(clientId + ":" + clientSecret)
                    .toString("base64"); // questa buffer e il toString("base64") permette di  trasformare clientId:clientSecret in -> Y2xpZW50SWQ6Y2xpZW50U2VjcmV0 
                    //per poi usarlo nell'header

                const tokenResponse = await fetch(tokenUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + credenziali,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "grant_type=client_credentials"
                });

                const tokenData = await tokenResponse.json();

                if (!tokenResponse.ok) {
                    return req.error(
                        tokenResponse.status,
                        "Errore durante recupero token OAuth: " + JSON.stringify(tokenData)
                    );
                }

                const payload = {
                    ID: ID,
                    prezzo: prezzo
                };

                const integrationResponse = await fetch(endpointUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + tokenData.access_token,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const responseText = await integrationResponse.text();

                if (!integrationResponse.ok) {
                    return req.error(
                        integrationResponse.status,
                        "Errore da Integration Suite: " + responseText
                    );
                }

                const integrationData = JSON.parse(responseText);

                return {
                    status: integrationData.status,
                    message: integrationData.message,
                    ID: integrationData.ID,
                    prezzo: integrationData.prezzo
                };

            } catch (error) {
                return req.error(500, error.message);
            }
        });
})

