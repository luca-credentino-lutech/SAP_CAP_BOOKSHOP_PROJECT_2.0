using { sap.capire.bookshop as db } from '../db/schema';


service AdminService {
    entity Libri as projection on db.Libri;
    entity Autore as projection on db.Autore;
}


service UserService {
    @readonly entity Libri as projection on db.Libri;
}


service AuthService {
    
    function getUser() returns String; 
}

//chiunque sia loggato (admin o user)  chiama AuthService
annotate AuthService with @(restrict: [
    { grant: 'READ', to: 'authenticated-user' }
]);