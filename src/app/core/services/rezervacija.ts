import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ListaCekanja, Rezervacija } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RezervacijaService {
  private api = `${environment.apiUrl}/rezervacije`;
  private lcApi = `${environment.apiUrl}/listacekanja`;
  constructor(private http: HttpClient) {}

  getMoje() {
    return this.http.get<Rezervacija[]>(`${this.api}/moje`);
  }
  getByTermin(terminId: number) {
    return this.http.get<Rezervacija[]>(`${this.api}/termin/${terminId}`);
  }
  rezervisi(terminId: number) {
    return this.http.post<Rezervacija>(this.api, { terminId });
  }
  otkazi(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
  getMojeListe() {
    return this.http.get<ListaCekanja[]>(`${this.lcApi}/moje`);
  }
  pridruziListi(terminId: number) {
    return this.http.post(this.lcApi, { terminId });
  }
  otkaziListu(id: number) {
    return this.http.delete(`${this.lcApi}/${id}`);
  }
}
