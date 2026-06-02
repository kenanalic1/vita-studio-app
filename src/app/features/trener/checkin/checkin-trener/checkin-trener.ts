import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth';
import { Termin, CheckInListItem } from '../../../../core/models/models';

@Component({
  selector: 'app-checkin-trener',
  standalone: false,
  templateUrl: './checkin-trener.html',
  styleUrl: './checkin-trener.scss',
})
export class CheckinTrener implements OnInit {
  terminiDanas: Termin[] = [];
  selectedTermin: Termin | null = null;
  lista: CheckInListItem[] = [];
  searchTerm = '';
  loading = true;
  loadingLista = false;
  today = new Date();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const trenerId = this.auth.currentUser?.id ?? 0;
    const danas = new Date().toISOString().split('T')[0];

    this.http.get<Termin[]>(`${environment.apiUrl}/termini?datum=${danas}`).subscribe({
      next: (t) => {
        this.terminiDanas = t.filter(termin => termin.trenerId === trenerId);
        if (this.terminiDanas.length > 0) this.selectTermin(this.terminiDanas[0]);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectTermin(t: Termin) {
    this.selectedTermin = t;
    this.loadingLista = true;
    this.http.get<CheckInListItem[]>(`${environment.apiUrl}/checkin/termin/${t.id}`).subscribe({
      next: (lista) => {
        this.lista = lista;
        this.loadingLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  checkIn(clanId: number) {
    if (!this.selectedTermin) return;
    this.http.post(`${environment.apiUrl}/checkin`, {
      clanId,
      terminId: this.selectedTermin.id,
    }).subscribe({
      next: () => {
        const item = this.lista.find(l => l.clanId === clanId);
        if (item) item.stigao = true;
        this.cdr.detectChanges();
      },
      error: (e) => alert(e.error?.message ?? 'Greška pri check-in-u.'),
    });
  }

  get filteredLista(): CheckInListItem[] {
    if (!this.searchTerm) return this.lista;
    return this.lista.filter(l =>
      l.imePrezime.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      l.brojClanske.includes(this.searchTerm),
    );
  }

  get stigliCount(): number {
    return this.lista.filter(l => l.stigao).length;
  }

  get ukupnoTermina(): number {
    return this.terminiDanas.length;
  }

  get ukupnoUcesnica(): number {
    return this.terminiDanas.reduce((sum, t) => sum + t.brojRezervacija, 0);
  }

  getInitials(ime: string): string {
    const parts = ime.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : ime[0];
  }
}
