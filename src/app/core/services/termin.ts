import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Termin } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TerminService {
  private api = `${environment.apiUrl}/termini`;
  constructor(private http: HttpClient) {}

  getByDatum(datum: string) {
    return this.http.get<Termin[]>(`${this.api}?datum=${datum}`);
  }
  getByNedelja(ponedeljak: string) {
    return this.http.get<Termin[]>(`${this.api}/nedelja?ponedeljak=${ponedeljak}`);
  }
  getByTrenerNedelja(trenerId: number, ponedeljak: string) {
    return this.http.get<Termin[]>(
      `${this.api}/trener/${trenerId}/nedelja?ponedeljak=${ponedeljak}`,
    );
  }
  getById(id: number) {
    return this.http.get<Termin>(`${this.api}/${id}`);
  }
  create(dto: any) {
    return this.http.post<Termin>(this.api, dto);
  }
  update(id: number, dto: any) {
    return this.http.put<Termin>(`${this.api}/${id}`, dto);
  }
  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
