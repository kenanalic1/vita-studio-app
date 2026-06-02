import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth';
import { Clanarina } from '../../../../core/models/models';

interface Paket {
  tip: 'mesecna' | 'kvartalna' | 'godisnja';
  naziv: string;
  trajanje: number;
  trajanjeTekst: string;
  cena: number;
  icon: string;
  popular: boolean;
}

@Component({
  selector: 'app-moja-clanarina',
  standalone: false,
  templateUrl: './moja-clanarina.html',
  styleUrl: './moja-clanarina.scss',
})
export class MojaClanarina implements OnInit {
  clanarine: Clanarina[] = [];
  aktivna: Clanarina | null = null;
  loading = true;
  saving = false;
  errorMsg = '';

  selectedPaket: Paket | null = null;

  readonly paketi: Paket[] = [
    {
      tip: 'mesecna',
      naziv: 'Mesečna',
      trajanje: 30,
      trajanjeTekst: '30 dana',
      cena: 3000,
      icon: 'calendar',
      popular: false,
    },
    {
      tip: 'kvartalna',
      naziv: 'Kvartalna',
      trajanje: 90,
      trajanjeTekst: '90 dana',
      cena: 8500,
      icon: 'star',
      popular: true,
    },
    {
      tip: 'godisnja',
      naziv: 'Godišnja',
      trajanje: 365,
      trajanjeTekst: '365 dana',
      cena: 28000,
      icon: 'crown',
      popular: false,
    },
  ];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.auth.currentUser?.id ?? 0;
    this.http.get<Clanarina[]>(`${environment.apiUrl}/clanarine/clan/${id}`).subscribe({
      next: (lista) => {
        this.clanarine = lista;
        this.aktivna = lista.find(
          (c) => c.status === 'aktivna' && new Date(c.datumIsteka) > new Date(),
        ) ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get daysLeft(): number {
    if (!this.aktivna) return 0;
    return Math.floor((new Date(this.aktivna.datumIsteka).getTime() - Date.now()) / 86400000);
  }

  get isIskoro(): boolean {
    return !!this.aktivna && this.daysLeft <= 7;
  }

  get progress(): number {
    if (!this.aktivna) return 0;
    const total = new Date(this.aktivna.datumIsteka).getTime() - new Date(this.aktivna.datumPocetka).getTime();
    const elapsed = Date.now() - new Date(this.aktivna.datumPocetka).getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  get progressColor(): string {
    if (this.daysLeft <= 7) return '#ef4444';
    if (this.daysLeft <= 30) return '#f59e0b';
    return '#7c3aed';
  }

  datumIstekaZa(paket: Paket): string {
    const d = new Date();
    d.setDate(d.getDate() + paket.trajanje);
    return d.toLocaleDateString('sr-Latn', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  odaberi(paket: Paket) {
    this.selectedPaket = this.selectedPaket?.tip === paket.tip ? null : paket;
    this.errorMsg = '';
  }

  potvrdi() {
    if (!this.selectedPaket) return;
    this.saving = true;
    this.errorMsg = '';
    this.http.post(`${environment.apiUrl}/clanarine/samoodabir`, {
      tipPaketa: this.selectedPaket.tip,
      cena: this.selectedPaket.cena,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.selectedPaket = null;
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.errorMsg = e.error?.message ?? 'Greška. Pokušajte ponovo.';
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(status: string): string {
    if (status === 'aktivna') return 'tag-green';
    if (status === 'istekla') return 'tag-red';
    return 'tag-gray';
  }

  getTipLabel(tip: string): string {
    const map: Record<string, string> = {
      mesecna: 'Mesečna', kvartalna: 'Kvartalna',
      godisnja: 'Godišnja', posebna: 'Posebna',
    };
    return map[tip] ?? tip;
  }
}
