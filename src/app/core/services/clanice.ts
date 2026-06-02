import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Clan, ClanProfil } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClaniceService {
  private api = `${environment.apiUrl}/clanice`;
  constructor(private http: HttpClient) {}

  getAll(status?: string, search?: string) {
    let params: any = {};
    if (status) params['status'] = status;
    if (search) params['search'] = search;
    return this.http.get<Clan[]>(this.api, { params });
  }
  getById(id: number) {
    return this.http.get<ClanProfil>(`${this.api}/${id}`);
  }
  create(dto: any) {
    return this.http.post<Clan>(this.api, dto);
  }
  update(id: number, dto: any) {
    return this.http.put<Clan>(`${this.api}/${id}`, dto);
  }
  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
