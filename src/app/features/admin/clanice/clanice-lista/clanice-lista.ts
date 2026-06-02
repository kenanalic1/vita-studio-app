import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Clan, Clanarina } from '../../../../core/models/models';

@Component({
  selector: 'app-clanice-lista',
  standalone: false,
  templateUrl: './clanice-lista.html',
  styleUrl: './clanice-lista.scss',
})
export class ClaniceLista implements OnInit {
  clanice: Clan[] = [];
  filteredClanice: Clan[] = [];
  pendingClanice: Clan[] = [];
  filteredPending: Clan[] = [];
  clanarine: Map<number, Clanarina> = new Map();
  filter = 'sve';
  searchTerm = '';
  loading = true;
  actionLoading = new Set<number>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loading = true;
    forkJoin({
      clanice:   this.http.get<Clan[]>(`${environment.apiUrl}/clanice`),
      clanarine: this.http.get<Clanarina[]>(`${environment.apiUrl}/clanarine`),
    }).subscribe({
      next: ({ clanice, clanarine }) => {
        this.clanice = clanice.filter((c) => c.status !== 'pending');
        this.filteredClanice = this.clanice;
        this.clanarine.clear();
        clanarine.forEach((c) => {
          if (!this.clanarine.has(c.clanId) || c.status === 'aktivna') {
            this.clanarine.set(c.clanId, c);
          }
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.http.get<Clan[]>(`${environment.apiUrl}/clanice/pending`).subscribe({
      next: (lista) => {
        this.pendingClanice = lista;
        this.filteredPending = lista;
        this.cdr.detectChanges();
      },
    });
  }

  get counts() {
    return {
      sve: this.clanice.length,
      aktivne: this.clanice.filter((c) => this.getStatusKey(c.id) === 'aktivna').length,
      istice: this.clanice.filter((c) => this.getStatusKey(c.id) === 'istice').length,
      istekle: this.clanice.filter((c) => this.getStatusKey(c.id) === 'istekla').length,
      cekanje: this.pendingClanice.length,
    };
  }

  setFilter(f: string) {
    this.filter = f;
    this.applyFilter();
  }

  onSearch() {
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    if (this.filter === 'cekanje') {
      this.filteredPending = term
        ? this.pendingClanice.filter((c) =>
            `${c.ime} ${c.prezime} ${c.email}`.toLowerCase().includes(term),
          )
        : [...this.pendingClanice];
      return;
    }
    let result = this.clanice;
    if (term)
      result = result.filter((c) =>
        `${c.ime} ${c.prezime} ${c.email}`.toLowerCase().includes(term),
      );
    if (this.filter !== 'sve')
      result = result.filter((c) => this.getStatusKey(c.id) === this.filter);
    this.filteredClanice = result;
  }

  odobri(id: number, event: Event) {
    event.stopPropagation();
    this.actionLoading.add(id);
    this.http.put(`${environment.apiUrl}/clanice/${id}/odobri`, {}).subscribe({
      next: () => {
        this.actionLoading.delete(id);
        this.pendingClanice = this.pendingClanice.filter((c) => c.id !== id);
        this.applyFilter();
        this.http.get<Clan[]>(`${environment.apiUrl}/clanice`).subscribe((lista) => {
          this.clanice = lista;
          this.cdr.detectChanges();
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading.delete(id);
        this.cdr.detectChanges();
      },
    });
  }

  odbij(id: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Odbiti i obrisati ovaj nalog?')) return;
    this.actionLoading.add(id);
    this.http.delete(`${environment.apiUrl}/clanice/${id}/odbij`).subscribe({
      next: () => {
        this.actionLoading.delete(id);
        this.pendingClanice = this.pendingClanice.filter((c) => c.id !== id);
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading.delete(id);
        this.cdr.detectChanges();
      },
    });
  }

  getClanarina(clanId: number): Clanarina | undefined {
    return this.clanarine.get(clanId);
  }

  getStatusKey(clanId: number): string {
    const c = this.clanarine.get(clanId);
    if (!c || c.status !== 'aktivna') return 'istekla';
    const days = Math.floor((new Date(c.datumIsteka).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'istekla';
    return days <= 7 ? 'istice' : 'aktivna';
  }

  getStatusClass(clanId: number): string {
    const k = this.getStatusKey(clanId);
    return k === 'aktivna' ? 'tag-green' : k === 'istice' ? 'tag-yellow' : 'tag-red';
  }

  getStatusLabel(clanId: number): string {
    const k = this.getStatusKey(clanId);
    return k === 'aktivna' ? '● aktivna' : k === 'istice' ? '● ističe' : '● istekla';
  }

  getDaysLeft(clanId: number): string {
    const c = this.clanarine.get(clanId);
    if (!c) return '';
    const days = Math.floor((new Date(c.datumIsteka).getTime() - Date.now()) / 86400000);
    return days > 0 ? `za ${days} dana` : 'istekla';
  }

  openProfil(id: number) {
    this.router.navigate(['/admin/clanice', id]);
  }
  showNovaClanica = false;

  onClanicaSacuvana() {
    this.showNovaClanica = false;
    this.ngOnInit();
  }
}
