import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ListaCekanjaAdmin } from '../../../core/models/models';

@Component({
  selector: 'app-lista-cekanja',
  standalone: false,
  templateUrl: './lista-cekanja.html',
  styleUrl: './lista-cekanja.scss',
})
export class ListaCekanja implements OnInit {
  sve: ListaCekanjaAdmin[] = [];
  filtered: ListaCekanjaAdmin[] = [];
  searchTerm = '';
  datumFilter = '';
  loading = true;
  uklanjajuciId: number | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    let url = `${environment.apiUrl}/listacekanja`;
    if (this.datumFilter) url += `?datum=${this.datumFilter}`;

    this.http.get<ListaCekanjaAdmin[]>(url).subscribe({
      next: (data) => {
        this.sve = data;
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
    this.filtered = this.sve.filter(l =>
      l.clanImePrezime.toLowerCase().includes(q) ||
      l.aktivnostNaziv.toLowerCase().includes(q) ||
      l.trenerImePrezime.toLowerCase().includes(q),
    );
  }

  onSearch() { this.applySearch(); }
  onDatumChange() { this.load(); }
  resetDatum() { this.datumFilter = ''; this.load(); }

  ukloni(id: number, imePrezime: string) {
    if (!confirm(`Ukloniti ${imePrezime} s liste čekanja?`)) return;
    this.uklanjajuciId = id;
    this.http.delete(`${environment.apiUrl}/listacekanja/${id}`).subscribe({
      next: () => {
        this.uklanjajuciId = null;
        this.sve = this.sve.filter(l => l.id !== id);
        this.applySearch();
        this.cdr.detectChanges();
      },
      error: () => {
        this.uklanjajuciId = null;
        this.cdr.detectChanges();
      },
    });
  }

  get grupePoTerminu(): { terminId: number; naziv: string; datumVreme: string; sala: string; trener: string; stavke: ListaCekanjaAdmin[] }[] {
    const mapa = new Map<number, ListaCekanjaAdmin[]>();
    for (const l of this.filtered) {
      if (!mapa.has(l.terminId)) mapa.set(l.terminId, []);
      mapa.get(l.terminId)!.push(l);
    }
    return Array.from(mapa.entries()).map(([terminId, stavke]) => ({
      terminId,
      naziv:     stavke[0].aktivnostNaziv,
      datumVreme: stavke[0].terminDatumVreme,
      sala:      stavke[0].salaNaziv,
      trener:    stavke[0].trenerImePrezime,
      stavke,
    }));
  }

  get ukupno(): number { return this.sve.length; }
  get ukupnoTermina(): number { return new Set(this.sve.map(l => l.terminId)).size; }
}
