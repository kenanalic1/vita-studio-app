import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Aktivnost } from '../../../core/models/models';

@Component({
  selector: 'app-aktivnosti',
  standalone: false,
  templateUrl: './aktivnosti.html',
  styleUrl: './aktivnosti.scss'
})
export class Aktivnosti implements OnInit {
  aktivnosti: Aktivnost[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.http.get<Aktivnost[]>(`${environment.apiUrl}/aktivnosti`).subscribe({
      next: (a) => { this.aktivnosti = a; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  getTipClass(tip: string): string {
    return tip === 'grupni' ? 'tag-purple' : 'tag-blue';
  }

  showNovaAktivnost = false;
  showEditAktivnost = false;
  editAktivnost: Aktivnost | null = null;

  onAktivnostSacuvana() {
    this.showNovaAktivnost = false;
    this.showEditAktivnost = false;
    this.editAktivnost = null;
    this.ngOnInit();
  }

  openEdit(a: Aktivnost) {
    this.editAktivnost = a;
    this.showEditAktivnost = true;
    this.cdr.detectChanges();
  }

  deleteAktivnost(a: Aktivnost) {
    if (!confirm(`Obrisati aktivnost "${a.naziv}"?\n\nOvo će obrisati i sve termine koji koriste ovu aktivnost.`)) return;
    this.http.delete(`${environment.apiUrl}/aktivnosti/${a.id}`).subscribe({
      next: () => this.ngOnInit(),
      error: (e) => alert(e.error?.message ?? 'Greška pri brisanju.'),
    });
  }
}