--- Create table statements ---

CREATE TABLE Allomas (
  id        NUMBER        NOT NULL,
  nev       VARCHAR2(100) NOT NULL,
  szelesseg BINARY_FLOAT,
  hosszusag BINARY_FLOAT,
  PRIMARY KEY (id)
);
/

CREATE TABLE Jarat (
  jaratszam     NUMBER NOT NULL,
  uthossz       NUMBER(5),
  indulasi_ido  DATE,
  indulasi_hely NUMBER NOT NULL,
  erkezesi_ido  DATE,
  erkezesi_hely NUMBER NOT NULL,
  PRIMARY KEY (jaratszam),
  FOREIGN KEY (indulasi_hely) REFERENCES Allomas (id),
  FOREIGN KEY (erkezesi_hely) REFERENCES Allomas (id)
);
/

CREATE TABLE Atszallas (
  ido       DATE,
  hely      NUMBER NOT NULL,
  jaratszam NUMBER NOT NULL,
  FOREIGN KEY (hely) REFERENCES Allomas (id),
  FOREIGN KEY (jaratszam) REFERENCES Jarat (jaratszam)
);
/

CREATE TABLE Arkategoria (
  ar        NUMBER(5)    NOT NULL,
  cimke     VARCHAR2(50) NOT NULL,
  jaratszam NUMBER       NOT NULL,
  PRIMARY KEY (jaratszam, cimke),
  FOREIGN KEY (jaratszam) REFERENCES Jarat (jaratszam)
);
/

CREATE TABLE Kedvezmeny (
  id     NUMBER       NOT NULL,
  szorzo BINARY_FLOAT NOT NULL,
  nev    VARCHAR2(50) NOT NULL,
  PRIMARY KEY (id)
);
/

CREATE TABLE Jegy (
  uuid         VARCHAR2(36)  NOT NULL,
  utas_neve    VARCHAR2(100) NOT NULL,
  kocsiosztaly VARCHAR2(50)  NOT NULL,
  jaratszam    NUMBER        NOT NULL,
  kedvezmeny   NUMBER        NOT NULL,
  PRIMARY KEY (uuid),
  FOREIGN KEY (jaratszam, kocsiosztaly) REFERENCES Arkategoria (jaratszam, cimke),
  FOREIGN KEY (kedvezmeny) REFERENCES Kedvezmeny (id)
);


--- Auto increment triggers ---

CREATE SEQUENCE Allomas_seq;
/

CREATE OR REPLACE TRIGGER Allomas_trig
  BEFORE INSERT
  ON Allomas
  FOR EACH ROW
  WHEN (new.id IS NULL)
  BEGIN
    :new.id := Allomas_seq.NEXTVAL;
  END;
/

CREATE SEQUENCE Jarat_seq;
/

CREATE OR REPLACE TRIGGER Jarat_trig
  BEFORE INSERT
  ON Jarat
  FOR EACH ROW
  WHEN (new.jaratszam IS NULL)
  BEGIN
    :new.jaratszam := Jarat_seq.NEXTVAL;
  END;
/

CREATE SEQUENCE Kedvezmeny_seq;
/

CREATE OR REPLACE TRIGGER Kedvezmeny_trig
  BEFORE INSERT
  ON Kedvezmeny
  FOR EACH ROW
  WHEN (new.id IS NULL)
  BEGIN
    :new.id := Allomas_seq.NEXTVAL;
  END;
