import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PregledService } from '../../../core/services/pregled';
import { RezervacijaService } from '../../../core/services/rezervacija';
import { AuthService } from '../../../core/services/auth';
import { ClanPocetna, Termin } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clan-pocetna',
  standalone: false,
  templateUrl: './pocetna.html',
  styleUrl: './pocetna.scss',
})
export class Pocetna implements OnInit {
  pocetna: ClanPocetna | null = null;
  today = new Date();
  loading = true;

  showPredlozenoFilter = false;
  predlozenoFilter = 'Sve';
  predlozenoAktivnosti: string[] = ['Sve'];
  rezervisaniIds = new Set<number>();

  constructor(
    private svc: PregledService,
    private rezSvc: RezervacijaService,
    private auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.auth.currentUser?.id ?? 0;
    this.svc.getClanPocetna(id).subscribe({
      next: (p) => {
        this.pocetna = p;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.http.get<{ naziv: string }[]>(`${environment.apiUrl}/aktivnosti`).subscribe({
      next: (aktivnosti) => {
        this.predlozenoAktivnosti = ['Sve', ...aktivnosti.map(a => a.naziv)];
        this.cdr.detectChanges();
      },
    });

    this.rezSvc.getMoje().subscribe({
      next: (lista) => {
        this.rezervisaniIds = new Set(lista.filter(r => r.status === 'aktivna').map(r => r.terminId));
        this.cdr.detectChanges();
      },
    });
  }

  get userName(): string {
    return this.auth.currentUser?.ime ?? '';
  }

  get imAktivnuClanarinu(): boolean {
    return !!this.pocetna?.aktivnaClanarina;
  }

  getDaysLeft(): number {
    if (!this.pocetna?.aktivnaClanarina) return 0;
    return Math.max(
      0,
      Math.floor(
        (new Date(this.pocetna.aktivnaClanarina.datumIsteka).getTime() - Date.now()) / 86400000,
      ),
    );
  }

  getClanarinaProgress(): number {
    if (!this.pocetna?.aktivnaClanarina) return 0;
    const cl = this.pocetna.aktivnaClanarina;
    const total = new Date(cl.datumIsteka).getTime() - new Date(cl.datumPocetka).getTime();
    const elapsed = Date.now() - new Date(cl.datumPocetka).getTime();
    return Math.min(100, (elapsed / total) * 100);
  }

  getPredlozenoColor(naziv: string): string {
    const map: Record<string, string> = {
      'Yin Joga': '#eff6ff',
      'Pilates Reformer': '#fdf2f8',
      Stretching: '#f0fdf4',
    };
    return map[naziv] ?? '#fafafa';
  }

  get filteredPredlozeno(): Termin[] {
    if (!this.pocetna?.predlozenoZaTebe) return [];
    const budući = this.pocetna.predlozenoZaTebe.filter(t => !this.isPast(t.datumVreme));
    if (this.predlozenoFilter === 'Sve') return budući;
    return budući.filter((t) =>
      t.aktivnostNaziv.toLowerCase().includes(this.predlozenoFilter.toLowerCase()),
    );
  }

  setPredlozenoFilter(f: string) {
    this.predlozenoFilter = f;
    this.showPredlozenoFilter = false;
  }

  rezervisi(terminId: number) {
    this.rezSvc.rezervisi(terminId).subscribe({
      next: () => {
        this.rezervisaniIds.add(terminId);
        this.cdr.detectChanges();
        this.ngOnInit();
      },
      error: (e) => alert(e.error?.message ?? 'Greška pri rezervaciji.'),
    });
  }

  pridruziListi(terminId: number) {
    this.rezSvc.pridruziListi(terminId).subscribe({
      next: () => this.ngOnInit(),
      error: (e) => alert(e.error?.message ?? 'Greška pri prijavi na listu čekanja.'),
    });
  }

  otkazi(id: number) {
    this.rezSvc.otkazi(id).subscribe({
      next: () => this.ngOnInit(),
      error: () => {},
    });
  }

  isPast(datumVreme: string): boolean {
    return new Date(datumVreme) < new Date();
  }

  get referralCode(): string {
    const id = this.auth.currentUser?.id ?? 0;
    return `VITA-${String(id).padStart(4, '0')}`;
  }

  kopirano = false;

  kopirajKod() {
    navigator.clipboard.writeText(this.referralCode).then(() => {
      this.kopirano = true;
      setTimeout(() => { this.kopirano = false; this.cdr.detectChanges(); }, 2000);
    });
  }
}
