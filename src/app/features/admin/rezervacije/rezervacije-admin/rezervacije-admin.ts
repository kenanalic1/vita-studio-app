import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Rezervacija } from '../../../../core/models/models';

@Component({
  selector: 'app-rezervacije-admin',
  standalone: false,
  templateUrl: './rezervacije-admin.html',
  styleUrl: './rezervacije-admin.scss',
})
export class RezervacijeAdmin implements OnInit {
  sve: Rezervacija[] = [];
  filtered: Rezervacija[] = [];
  searchTerm = '';
  statusFilter = 'sve';
  datumFilter = '';
  loading = true;
  otkazujeId: number | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    let url = `${environment.apiUrl}/rezervacije`;
    const params: string[] = [];
    if (this.statusFilter !== 'sve') params.push(`status=${this.statusFilter}`);
    if (this.datumFilter) params.push(`datum=${this.datumFilter}`);
    if (params.length) url += '?' + params.join('&');

    this.http.get<Rezervacija[]>(url).subscribe({
      next: (r) => {
        this.sve = r;
        this.applySearch();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applySearch() {
    if (!this.searchTerm) { this.filtered = this.sve; return; }
    const q = this.searchTerm.toLowerCase();
    this.filtered = this.sve.filter(r =>
      r.clanImePrezime.toLowerCase().includes(q) ||
      r.aktivnostNaziv.toLowerCase().includes(q) ||
      r.trenerImePrezime.toLowerCase().includes(q),
    );
  }

  onSearch() { this.applySearch(); }

  setStatus(s: string) {
    this.statusFilter = s;
    this.load();
  }

  onDatumChange() { this.load(); }

  resetDatum() {
    this.datumFilter = '';
    this.load();
  }

  otkazi(id: number) {
    if (!confirm('Otkazati ovu rezervaciju? Prva osoba s liste čekanja bit će automatski promovirana.')) return;
    this.otkazujeId = id;
    this.http.delete(`${environment.apiUrl}/rezervacije/${id}/admin`).subscribe({
      next: () => {
        this.otkazujeId = null;
        this.load();
      },
      error: (e) => {
        this.otkazujeId = null;
        alert(e.error?.message ?? 'Greška pri otkazivanju.');
        this.cdr.detectChanges();
      },
    });
  }

  get counts() {
    return {
      sve:      this.sve.length,
      aktivne:  this.sve.filter(r => r.status === 'aktivna').length,
      otkazane: this.sve.filter(r => r.status === 'otkazana').length,
      zavrsene: this.sve.filter(r => r.status === 'zavrsena').length,
    };
  }

  getStatusClass(status: string): string {
    if (status === 'aktivna')  return 'tag-green';
    if (status === 'otkazana') return 'tag-red';
    return 'tag-blue';
  }

  getStatusLabel(status: string): string {
    if (status === 'aktivna')  return '● aktivna';
    if (status === 'otkazana') return '● otkazana';
    return '● završena';
  }
}
