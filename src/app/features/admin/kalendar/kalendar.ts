import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Aktivnost, Termin, Trener } from '../../../core/models/models';

@Component({
  selector: 'app-kalendar',
  standalone: false,
  templateUrl: './kalendar.html',
  styleUrl: './kalendar.scss',
})
export class Kalendar implements OnInit {
  termini: Termin[] = [];
  currentDate = new Date();
  dani: { date: Date; termini: Termin[] }[] = [];
  loading = true;

  aktivnosti: Aktivnost[] = [];
  treneri: Trener[] = [];
  filterAktivnost = '';
  filterTrener = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const trenerId = this.route.snapshot.queryParamMap.get('trenerId');
    if (trenerId) this.filterTrener = trenerId;

    forkJoin({
      aktivnosti: this.http.get<Aktivnost[]>(`${environment.apiUrl}/aktivnosti`),
      treneri: this.http.get<Trener[]>(`${environment.apiUrl}/treneri`),
    }).subscribe({
      next: ({ aktivnosti, treneri }) => {
        this.aktivnosti = aktivnosti;
        this.treneri = treneri;
        this.cdr.detectChanges();
      },
    });
    this.loadNedelja();
  }

  loadNedelja() {
    this.loading = true;
    const ponedeljak = this.getPonedeljak(this.currentDate);
    this.http
      .get<Termin[]>(`${environment.apiUrl}/termini/nedelja?ponedeljak=${this.toLocalDate(ponedeljak)}`)
      .subscribe({
        next: (t) => {
          this.termini = t;
          this.buildDani(ponedeljak);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  buildDani(ponedeljak: Date) {
    this.dani = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ponedeljak);
      d.setDate(ponedeljak.getDate() + i);
      const dayTermini = this.filteredTermini.filter((t) => {
        return new Date(t.datumVreme).toDateString() === d.toDateString();
      });
      this.dani.push({ date: d, termini: dayTermini });
    }
  }

  get filteredTermini(): Termin[] {
    return this.termini.filter((t) => {
      const aktivnostOk = !this.filterAktivnost || t.aktivnostNaziv === this.filterAktivnost;
      const trenerOk = !this.filterTrener || t.trenerId === +this.filterTrener;
      return aktivnostOk && trenerOk;
    });
  }

  onFilterChange() {
    this.buildDani(this.getPonedeljak(this.currentDate));
    this.cdr.detectChanges();
  }

  getPonedeljak(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  prevNedelja() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.currentDate = new Date(this.currentDate);
    this.loadNedelja();
  }

  nextNedelja() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.currentDate = new Date(this.currentDate);
    this.loadNedelja();
  }

  danas() {
    this.currentDate = new Date();
    this.loadNedelja();
  }

  getTerminColor(naziv: string): string {
    const colors: Record<string, string> = {
      'Vinyasa Flow': '#f0fdf4', 'Yin Joga': '#eff6ff',
      'Pilates Mat': '#fdf2f8', 'Pilates Reformer': '#fdf2f8',
      Aerobik: '#fff7ed', Zumba: '#fefce8',
      Stretching: '#f0fdf4', Barre: '#fce7f3', Meditacija: '#f5f3ff',
    };
    return colors[naziv] ?? '#f9fafb';
  }

  getTerminBorder(naziv: string): string {
    const colors: Record<string, string> = {
      'Vinyasa Flow': '#86efac', 'Yin Joga': '#93c5fd',
      'Pilates Mat': '#f9a8d4', 'Pilates Reformer': '#f9a8d4',
      Aerobik: '#fdba74', Zumba: '#fde047',
      Stretching: '#86efac', Barre: '#f0abfc', Meditacija: '#c4b5fd',
    };
    return colors[naziv] ?? '#e5e7eb';
  }

  private toLocalDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  showNoviTermin = false;
  showEditTermin = false;
  editTermin: Termin | null = null;

  onTerminSacuvan() {
    this.showNoviTermin = false;
    this.showEditTermin = false;
    this.editTermin = null;
    this.loadNedelja();
  }

  openEdit(t: Termin) {
    this.editTermin = t;
    this.showEditTermin = true;
  }

  deleteTermin(t: Termin) {
    const dt = new Date(t.datumVreme).toLocaleString('sr-Latn', { dateStyle: 'short', timeStyle: 'short' });
    if (!confirm(`Obrisati termin "${t.aktivnostNaziv}" (${dt})?\n\nSve aktivne rezervacije za ovaj termin biće otkazane.`)) return;
    this.http.delete(`${environment.apiUrl}/termini/${t.id}`).subscribe({
      next: () => this.loadNedelja(),
      error: (e) => alert(e.error?.message ?? 'Greška pri brisanju termina.'),
    });
  }
}
