import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Clanarina } from '../../../core/models/models';

interface Paket {
  tip: string;
  naziv: string;
  opis: string;
  trajanje: string;
  cena: number;
  defaultNaziv: string;
  icon: string;
  highlight: boolean;
}

@Component({
  selector: 'app-clanarine',
  standalone: false,
  templateUrl: './clanarine.html',
  styleUrl: './clanarine.scss',
})
export class Clanarine implements OnInit {
  clanarine: Clanarina[] = [];
  loading = true;
  filter: 'sve' | 'aktivna' | 'istekla' = 'aktivna';

  showModal = false;
  modalPaket: Paket | null = null;

  readonly paketi: Paket[] = [
    {
      tip: 'mesecna',
      naziv: 'Mesečna',
      opis: 'Idealna za početnike ili povremene posjetioce.',
      trajanje: '30 dana',
      cena: 3000,
      defaultNaziv: 'Mesečna članarina',
      icon: 'calendar',
      highlight: false,
    },
    {
      tip: 'kvartalna',
      naziv: 'Kvartalna',
      opis: 'Najpopularniji izbor — uštedi 500 RSD vs mesečna.',
      trajanje: '90 dana',
      cena: 8500,
      defaultNaziv: 'Kvartalna članarina',
      icon: 'star',
      highlight: true,
    },
    {
      tip: 'godisnja',
      naziv: 'Godišnja',
      opis: 'Maksimalna ušteda za redovne posjetioce.',
      trajanje: '365 dana',
      cena: 28000,
      defaultNaziv: 'Godišnja članarina',
      icon: 'crown',
      highlight: false,
    },
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<Clanarina[]>(`${environment.apiUrl}/clanarine`).subscribe({
      next: (c) => {
        this.clanarine = c;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filtered(): Clanarina[] {
    if (this.filter === 'sve') return this.clanarine;
    return this.clanarine.filter((c) => c.status === this.filter);
  }

  get counts() {
    return {
      sve:      this.clanarine.length,
      aktivna:  this.clanarine.filter((c) => c.status === 'aktivna').length,
      istekla:  this.clanarine.filter((c) => c.status === 'istekla').length,
    };
  }

  otvoriModal(paket?: Paket) {
    this.modalPaket = paket ?? null;
    this.showModal = true;
  }

  onSacuvano() {
    this.showModal = false;
    this.load();
  }

  getStatusClass(status: string): string {
    if (status === 'aktivna') return 'tag-green';
    if (status === 'istekla') return 'tag-red';
    return 'tag-gray';
  }
}
