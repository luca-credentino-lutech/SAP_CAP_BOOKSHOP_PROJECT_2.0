using { managed } from '@sap/cds/common';
namespace sap.capire.bookshop; 

entity Libri : managed { 
  key ID : UUID;
  titolo  :  String(100);
  descrizione  : String(1000);
  autore : Association to Autore;
  genere  : String(100);
  stock  : Integer; //quantità
  prezzo  : Decimal(9,2);
}

entity Autore : managed { 
  key ID : UUID;
  nome   : String(100);
  libri  : Association to many Libri on libri.autore = $self;
}

