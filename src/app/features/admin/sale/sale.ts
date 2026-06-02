import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Sala } from '../../../core/models/models';

@Component({
  selector: 'app-sale',
  standalone: false,
  templateUrl: './sale.html',
  styleUrl: './sale.scss',
})
export class Sale implements OnInit {
  sale: Sala[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.http.get<Sala[]>(`${environment.apiUrl}/sale`).subscribe({
      next: (s) => {
        this.sale = s;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
  showNovaSala = false;
  showEditSala = false;
  editSala: Sala | null = null;

  onSalaSacuvana() {
    this.showNovaSala = false;
    this.showEditSala = false;
    this.editSala = null;
    this.ngOnInit();
  }

  openEdit(s: Sala) {
    this.editSala = s;
    this.showEditSala = true;
    this.cdr.detectChanges();
  }

  deleteSala(s: Sala) {
    if (!confirm(`Obrisati salu "${s.naziv}"?`)) return;
    this.http.delete(`${environment.apiUrl}/sale/${s.id}`).subscribe({
      next: () => this.ngOnInit(),
      error: (e) => alert(e.error?.message ?? 'Greška pri brisanju.'),
    });
  }
}
