import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Termin, CheckInListItem, CheckInStatistika } from '../../../../core/models/models';

@Component({
  selector: 'app-checkin-admin',
  standalone: false,
  templateUrl: './checkin-admin.html',
  styleUrl: './checkin-admin.scss',
})
export class CheckinAdmin implements OnInit {
  terminiDanas: Termin[] = [];
  selectedTermin: Termin | null = null;
  lista: CheckInListItem[] = [];
  statistika: CheckInStatistika | null = null;
  searchTerm = '';
  loading = true;
  loadingLista = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const danas = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    this.http.get<Termin[]>(`${environment.apiUrl}/termini?datum=${danas}`).subscribe({
      next: (t) => {
        this.terminiDanas = t;
        if (t.length > 0) this.selectTermin(t[0]);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.http.get<CheckInStatistika>(`${environment.apiUrl}/checkin/statistika`).subscribe({
      next: (s) => {
        this.statistika = s;
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
    this.http
      .post(`${environment.apiUrl}/checkin`, {
        clanId,
        terminId: this.selectedTermin.id,
      })
      .subscribe({
        next: () => {
          const item = this.lista.find((l) => l.clanId === clanId);
          if (item) item.stigao = true;
          this.cdr.detectChanges();
        },
        error: (e) => alert(e.error?.message ?? 'Greška.'),
      });
  }

  get filteredLista(): CheckInListItem[] {
    if (!this.searchTerm) return this.lista;
    return this.lista.filter(
      (l) =>
        l.imePrezime.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        l.brojClanske.includes(this.searchTerm),
    );
  }

  get stigliCount(): number {
    return this.lista.filter((l) => l.stigao).length;
  }

  getInitials(ime: string): string {
    const parts = ime.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : ime[0];
  }

  showRucniUnos = false;
  rucniInput = '';
  rucniGreska = '';

  rucniCheckIn() {
    const term = this.rucniInput.trim().toLowerCase();
    if (!term) return;

    const match = this.lista.find(
      (l) =>
        l.imePrezime.toLowerCase().includes(term) ||
        l.brojClanske.toLowerCase() === term,
    );

    if (!match) {
      this.rucniGreska = 'Članica nije pronađena u ovom terminu.';
      return;
    }
    if (match.stigao) {
      this.rucniGreska = 'Članica je već evidentirana.';
      return;
    }

    this.rucniGreska = '';
    this.checkIn(match.clanId);
    this.rucniInput = '';
    this.showRucniUnos = false;
  }
}
