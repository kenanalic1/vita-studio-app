export interface AuthResponse {
  token: string;
  id: number;
  ime: string;
  prezime: string;
  email: string;
  uloga: 'clan' | 'trener' | 'administrator';
}

export interface LoginDto {
  email: string;
  lozinka: string;
  uloga: 'clan' | 'trener' | 'administrator';
}

export interface Clan {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  datumRodjenja: string;
  datumKreiranja: string;
  status: 'aktivan' | 'pending' | 'odbijen';
}

export interface ClanProfil extends Clan {
  aktivnaClanarina: Clanarina | null;
  ukupnoTermina: number;
  otkazivanja: number;
  naListiCekanja: number;
  dolasci30d: number;
  istorijaDolazaka: EvidencijaDolaska[];
  predstojeciTermini: Rezervacija[];
}

export interface Trener {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  specijalizacija: string;
}

export interface Aktivnost {
  id: number;
  naziv: string;
  opis: string | null;
  tipAktivnosti: 'grupni' | 'teretana' | 'teren';
  treneri: string[];
  popunjenost: number;
}

export interface Sala {
  id: number;
  naziv: string;
  kapacitet: number;
  tip: 'sala' | 'teren' | 'teretana';
  terminiNed: number;
  popunjenost: number;
}

export interface Termin {
  id: number;
  datumVreme: string;
  trajanje: number;
  maxKapacitet: number;
  brojRezervacija: number;
  brojNaListiCekanja: number;
  aktivnostId: number;
  aktivnostNaziv: string;
  tipAktivnosti: string;
  trenerId: number;
  trenerImePrezime: string;
  salaId: number;
  salaNaziv: string;
}

export interface Clanarina {
  id: number;
  tipPaketa: 'mesecna' | 'kvartalna' | 'godisnja' | 'posebna';
  nazivPaketa: string;
  datumPocetka: string;
  datumIsteka: string;
  cena: number;
  status: 'aktivna' | 'istekla' | 'otkazana';
  clanId: number;
  clanImePrezime: string | null;
}

export interface Rezervacija {
  id: number;
  datumRezervacije: string;
  status: 'aktivna' | 'otkazana' | 'zavrsena';
  clanId: number;
  clanImePrezime: string;
  terminId: number;
  terminDatumVreme: string;
  aktivnostNaziv: string;
  salaNaziv: string;
  trenerImePrezime: string;
}

export interface ListaCekanja {
  id: number;
  datumPrijave: string;
  pozicija: number;
  clanId: number;
  clanImePrezime: string;
  terminId: number;
  terminDatumVreme: string;
  aktivnostNaziv: string;
}

export interface ListaCekanjaAdmin extends ListaCekanja {
  salaNaziv: string;
  trenerImePrezime: string;
}

export interface EvidencijaDolaska {
  id: number;
  datumDolaska: string;
  clanId: number;
  clanImePrezime: string | null;
  terminId: number;
  aktivnostNaziv: string;
  trenerImePrezime: string;
  status: string;
}

export interface CheckInListItem {
  clanId: number;
  imePrezime: string;
  brojClanske: string;
  statusClanarine: string;
  stigao: boolean;
}

export interface CheckInStatistika {
  prijavljeno: number;
  stiglo: number;
  otkazano: number;
  listaCekanjaPromovisan: number;
}

export interface AdminPregled {
  prihodOvogMeseca: number;
  aktivneClanice: number;
  istekloOvogMeseca: number;
  popunjenostTermina: number;
  istekleZa7Dana: number;
  danasnjiRaspored: Termin[];
  popunjenostNedelje: { dan: string; procenat: number }[];
  listeCekanja: {
    terminId: number;
    aktivnostNaziv: string;
    datumVreme: string;
    brojNaListi: number;
  }[];
  nedavnaAktivnost: { tekst: string; vreme: string; tip: string }[];
}

export interface TrenerPregled {
  terminiOveNedelje: number;
  popunjenihTermina: number;
  ucesniceDanas: number;
  rastVsProslaNed: number;
  prosecnaPopunjenost: number;
  ukupnoNaListiCekanja: number;
  terminaSaListom: number;
  rasporedDanas: Termin[];
  rasporedNedelja: Termin[];
  specijalizacije: string[];
}

export interface ClanPocetna {
  aktivnaClanarina: Clanarina | null;
  dolazakaOvogMeseca: number;
  najdrazaAktivnost: string | null;
  najduzaSerija: number;
  clanOd: string;
  predstojeciTermini: Rezervacija[];
  predlozenoZaTebe: Termin[];
}

export interface Izvestaj {
  ukupanPrihod: number;
  prosecnaPopunjenost: number;
  retencijaClanica: number;
  prihodPoMesecima: { mesec: string; prihod: number }[];
  topAktivnosti: { naziv: string; popunjenost: number; brojTermina: number }[];
  distribucijaPaketa: { tipPaketa: string; brojAktivnih: number }[];
}

export interface Notifikacija {
  id: number;
  tekst: string;
  tip: 'info' | 'uspeh' | 'upozorenje';
  procitana: boolean;
  datumKreiranja: string;
}
