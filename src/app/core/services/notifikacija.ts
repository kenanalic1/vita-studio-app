import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notifikacija } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotifikacijaService implements OnDestroy {
  private api = `${environment.apiUrl}/notifikacije`;
  private _notifikacije = new BehaviorSubject<Notifikacija[]>([]);
  private _broj         = new BehaviorSubject<number>(0);
  private pollSub?: Subscription;

  notifikacije$ = this._notifikacije.asObservable();
  broj$         = this._broj.asObservable();

  constructor(private http: HttpClient) {}

  startPolling() {
    this.ucitaj();
    this.pollSub = interval(30_000).subscribe(() => this.ucitaj());
  }

  stopPolling() {
    this.pollSub?.unsubscribe();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  ucitaj() {
    this.http.get<Notifikacija[]>(`${this.api}/moje`).subscribe({
      next: (lista) => {
        this._notifikacije.next(lista);
        this._broj.next(lista.filter(n => !n.procitana).length);
      },
      error: () => {},
    });
  }

  procitajSve() {
    this.http.put(`${this.api}/procitaj-sve`, {}).subscribe({
      next: () => {
        const lista = this._notifikacije.value.map(n => ({ ...n, procitana: true }));
        this._notifikacije.next(lista);
        this._broj.next(0);
      },
      error: () => {},
    });
  }

  procitaj(id: number) {
    this.http.put(`${this.api}/${id}/procitaj`, {}).subscribe({
      next: () => {
        const lista = this._notifikacije.value.map(n =>
          n.id === id ? { ...n, procitana: true } : n
        );
        this._notifikacije.next(lista);
        this._broj.next(lista.filter(n => !n.procitana).length);
      },
      error: () => {},
    });
  }
}
