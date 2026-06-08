import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Aktivnost, Clanarina, Termin } from '../../../../core/models/models';
import { RezervacijaService } from '../../../../core/services/rezervacija';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-raspored-browse',
  standalone: false,
  templateUrl: './raspored-browse.html',
  styleUrl: './raspored-browse.scss',
})
export class RasporedBrowse implements OnInit {
  termini: Termin[] = [];
  filteredTermini: Termin[] = [];
  selectedDan: string = '';
  dani: { label: string; value: string }[] = [];
  aktivnostFilter = 'Sve';
  aktivnosti: string[] = ['Sve'];
  loading = true;
  currentWeekOffset = 0;
  imAktivnuClanarinu = true;
  rezervisaniIds = new Set<number>();

  isPast(datumVreme: string): boolean {
    return new Date(datumVreme) < new Date();
  }

  constructor(
    private http: HttpClient,
    private rezSvc: RezervacijaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.buildDani();
    this.loadTermini(this.selectedDan);
    this.checkClanarina();
    this.loadAktivnosti();
  }

  loadAktivnosti() {
    this.http.get<Aktivnost[]>(`${environment.apiUrl}/aktivnosti`).subscribe({
      next: (lista) => {
        this.aktivnosti = ['Sve', ...lista.map((a) => a.naziv)];
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  checkClanarina() {
    const id = this.auth.currentUser?.id;
    if (!id) { this.imAktivnuClanarinu = false; return; }
    this.http.get<Clanarina[]>(`${environment.apiUrl}/clanarine/clan/${id}`).subscribe({
      next: (list) => {
        const now = new Date();
        this.imAktivnuClanarinu = list.some(c => c.status === 'aktivna' && new Date(c.datumIsteka) > now);
        this.cdr.detectChanges();
      },
      error: () => { this.imAktivnuClanarinu = false; this.cdr.detectChanges(); },
    });
  }

  buildDani() {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + this.currentWeekOffset * 7);

    this.dani = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const pad = (n: number) => String(n).padStart(2, '0');
      const value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const label = d.toLocaleDateString('sr-Latn', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });
      this.dani.push({ label, value });
    }
    this.selectedDan = this.dani[0].value;
  }

  prevNedelja() {
    this.currentWeekOffset--;
    this.buildDani();
    this.loadTermini(this.selectedDan);
  }

  nextNedelja() {
    this.currentWeekOffset++;
    this.buildDani();
    this.loadTermini(this.selectedDan);
  }

  loadTermini(datum: string) {
    this.loading = true;
    this.http.get<Termin[]>(`${environment.apiUrl}/termini?datum=${datum}`).subscribe({
      next: (t) => {
        this.termini = t;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectDan(value: string) {
    this.selectedDan = value;
    this.loadTermini(value);
  }

  applyFilter() {
    if (this.aktivnostFilter === 'Sve') {
      this.filteredTermini = this.termini;
    } else {
      this.filteredTermini = this.termini.filter((t) =>
        t.aktivnostNaziv.toLowerCase().includes(this.aktivnostFilter.toLowerCase()),
      );
    }
  }

  setAktivnostFilter(a: string) {
    this.aktivnostFilter = a;
    this.applyFilter();
  }

  getSlotStatus(t: Termin): string {
    if (this.isPast(t.datumVreme)) return 'proslo';
    if (t.brojRezervacija >= t.maxKapacitet) return 'popunjeno';
    if (t.brojRezervacija / t.maxKapacitet > 0.75) return 'jos-mesta';
    return 'dostupno';
  }

  getSlotLabel(t: Termin): string {
    if (t.brojRezervacija >= t.maxKapacitet) return `Popunjeno · +${t.brojNaListiCekanja}`;
    return `${t.maxKapacitet - t.brojRezervacija} mesta od ${t.maxKapacitet}`;
  }

  rezervisi(terminId: number) {
    this.rezSvc.rezervisi(terminId).subscribe({
      next: () => {
        this.rezervisaniIds.add(terminId);
        this.cdr.detectChanges();
        this.loadTermini(this.selectedDan);
      },
      error: (e) => alert(e.error?.message ?? 'Greška.'),
    });
  }

  pridruziListi(terminId: number) {
    this.rezSvc.pridruziListi(terminId).subscribe({
      next: () => this.loadTermini(this.selectedDan),
      error: (e) => alert(e.error?.message ?? 'Greška.'),
    });
  }

  getCardColor(naziv: string): string {
    const map: Record<string, string> = {
      'Vinyasa Flow': '#f0fdf4',
      'Yin Joga': '#eff6ff',
      'Pilates Mat': '#fdf2f8',
      'Pilates Reformer': '#fdf2f8',
      Aerobik: '#fff7ed',
      Zumba: '#fefce8',
      Stretching: '#f0fdf4',
      Barre: '#fdf2f8',
    };
    return map[naziv] ?? '#fafafa';
  }
}
