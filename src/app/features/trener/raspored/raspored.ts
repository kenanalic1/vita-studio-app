import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth';
import { Termin } from '../../../core/models/models';

@Component({
  selector: 'app-trener-raspored',
  standalone: false,
  templateUrl: './raspored.html',
  styleUrl: './raspored.scss',
})
export class Raspored implements OnInit {
  termini: Termin[] = [];
  dani: { date: Date; termini: Termin[] }[] = [];
  loading = true;
  navigating = false;
  currentDate = new Date();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadNedelja(true);
  }

  loadNedelja(initial = false) {
    if (initial) {
      this.loading = true;
    } else {
      this.navigating = true;
    }

    const id = this.auth.currentUser?.id ?? 0;
    const ponedeljak = this.getPonedeljak(this.currentDate);
    const dateStr = this.toLocalDateStr(ponedeljak);

    this.http
      .get<Termin[]>(`${environment.apiUrl}/termini/trener/${id}/nedelja?ponedeljak=${dateStr}`)
      .subscribe({
        next: (t) => {
          this.termini = t;
          this.buildDani(ponedeljak);
          this.loading = false;
          this.navigating = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.navigating = false;
          this.cdr.detectChanges();
        },
      });
  }

  prevNedelja() {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.loadNedelja();
  }

  nextNedelja() {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.loadNedelja();
  }

  danas() {
    this.currentDate = new Date();
    this.loadNedelja();
  }

  get isCurrentWeek(): boolean {
    const ponedeljak = this.getPonedeljak(new Date());
    return this.getPonedeljak(this.currentDate).toDateString() === ponedeljak.toDateString();
  }

  getPonedeljak(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  }

  toLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  buildDani(ponedeljak: Date) {
    this.dani = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ponedeljak);
      d.setDate(ponedeljak.getDate() + i);
      this.dani.push({
        date: d,
        termini: this.termini.filter(
          (t) => new Date(t.datumVreme).toDateString() === d.toDateString(),
        ),
      });
    }
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  isPast(date: Date): boolean {
    return date < new Date() && !this.isToday(date);
  }

  getPercent(rez: number, max: number): number {
    return max > 0 ? Math.round((rez / max) * 100) : 0;
  }
}
