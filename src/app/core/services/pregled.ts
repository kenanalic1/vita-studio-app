import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminPregled, TrenerPregled, ClanPocetna, Izvestaj } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PregledService {
  private api = `${environment.apiUrl}/pregled`;

  constructor(private http: HttpClient) {}

  getAdminPregled() {
    return this.http.get<AdminPregled>(`${this.api}/admin`);
  }

  getTrenerPregled(trenerId: number) {
    return this.http.get<TrenerPregled>(`${this.api}/trener/${trenerId}`);
  }

  getClanPocetna(clanId: number) {
    return this.http.get<ClanPocetna>(`${this.api}/clan/${clanId}`);
  }

  getIzvestaj(meseci: number = 7) {
    return this.http.get<Izvestaj>(`${this.api}/izvestaji?meseci=${meseci}`);
  }
}
