import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckInListItem, CheckInStatistika, EvidencijaDolaska } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CheckinService {
  private api = `${environment.apiUrl}/checkin`;
  constructor(private http: HttpClient) {}

  getLista(terminId: number) {
    return this.http.get<CheckInListItem[]>(`${this.api}/termin/${terminId}`);
  }
  checkIn(clanId: number, terminId: number) {
    return this.http.post<EvidencijaDolaska>(this.api, { clanId, terminId });
  }
  undo(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
  getStatistika() {
    return this.http.get<CheckInStatistika>(`${this.api}/statistika`);
  }
}
