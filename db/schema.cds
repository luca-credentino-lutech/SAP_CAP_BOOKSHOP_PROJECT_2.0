using { Currency, managed, sap } from '@sap/cds/common';
namespace sap.capire.bookshop; 

entity Books : managed { 
  key ID : Integer;
  titolo  : localized String(111);
  descrizione  : localized String(1111);
  author : Association to Authors;
  genere  : Association to Genres;
  stock  : Integer;
  prezzo  : Decimal(9,2);
  currency : Currency;
}

entity Authors : managed { 
  key ID : Integer;
  name   : String(111);
  books  : Association to many Books on books.author = $self;
}


entity Genres { 
  key ID   : Integer;
  parent   : Association to Genres;
  children : Composition of many Genres on children.parent = $self;
}