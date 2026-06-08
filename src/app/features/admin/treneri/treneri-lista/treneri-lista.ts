import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Trener } from '../../../../core/models/models';

@Component({
  selector: 'app-treneri-lista',
  standalone: false,
  templateUrl: './treneri-lista.html',
  styleUrl: './treneri-lista.scss',
})
export class TreneriLista implements OnInit {
  treneri: Trener[] = [];
  searchTerm = '';
  loading = true;

  get filtered(): Trener[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.treneri;
    return this.treneri.filter(t =>
      t.ime.toLowerCase().includes(q) ||
      t.prezime.toLowerCase().includes(q) ||
      t.specijalizacija.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  }

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  openRaspored(trenerId: number) {
    this.router.navigate(['/admin/kalendar'], { queryParams: { trenerId } });
  }

  ngOnInit() {
    this.http.get<Trener[]>(`${environment.apiUrl}/treneri`).subscribe({
      next: (t) => {
        this.treneri = t;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getInitials(ime: string, prezime: string): string {
    return `${ime[0]}${prezime[0]}`;
  }

  getSpecijalizacije(spec: string): string[] {
    return spec.split('/').map((s) => s.trim());
  }

  showNoviTrener = false;
  showEditTrener = false;
  editTrener: Trener | null = null;

  onTrenerSacuvan() {
    this.showNoviTrener = false;
    this.showEditTrener = false;
    this.editTrener = null;
    this.ngOnInit();
  }

  openEdit(t: Trener) {
    this.editTrener = t;
    this.showEditTrener = true;
    this.cdr.detectChanges();
  }

  deleteTrener(t: Trener) {
    if (!confirm(`Obrisati trenera "${t.ime} ${t.prezime}"?\n\nSvi termini ovog trenera će biti obrisani.`)) return;
    this.http.delete(`${environment.apiUrl}/treneri/${t.id}`).subscribe({
      next: () => this.ngOnInit(),
      error: (e) => alert(e.error?.message ?? 'Greška pri brisanju.'),
    });
  }
}
