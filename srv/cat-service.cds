using {sap.capire.bookshop as db} from '../db/schema';

service AdminService {
    entity Libri  as projection on db.Libri;
    entity Autore as projection on db.Autore;

    action aggiungiLibro(ID: UUID,
                         titolo: String,
                         autore: String,
                         descrizione: String,
                         genere: String,
                         stock: Integer,
                         prezzo: Decimal(5, 2),
                         autore_ID: UUID) returns Libri;

    action aggiungiAutore(ID: UUID,
                          autore_ID: UUID,
                          nome: String, ) returns Autore;

    
    action updateLibro( ID: UUID,
                         titolo: String,
                         autore: String,
                         descrizione: String,
                         genere: String,
                         stock: Integer,
                         prezzo: Decimal(5, 2),
                         autore_ID: UUID) returns Libri;

    action eliminaRecord( ID: UUID) returns Libri;
}


service UserService {

    entity Libri as projection on db.Libri;


    action aggiornaStock(ID: UUID,
                         stock: Integer)  returns Libri;

}


service AuthService {

    function getUser()                    returns String;
}

//chiunque sia loggato (admin o user)  chiama AuthService
annotate AuthService with @(restrict: [{
    grant: 'READ',
    to   : 'authenticated-user'
}]);
