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
                    A
                });


             const tabAggiornato = await SELECT.one
                 .from(Libri)
                 .where({ ID: dati.ID });

             return tabAggiornato;


        } catch (err) {
            console.log(err);
            return req.error(500, err.message);
        }
    })
})

