import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RezervacijaService } from '../../../../core/services/rezervacija';
import { ListaCekanja, Rezervacija } from '../../../../core/models/models';

@Component({
  selector: 'app-moje-rezervacije',
  standalone: false,
  templateUrl: './moje-rezervacije.html',
  styleUrl: './moje-rezervacije.scss',
})
export class MojeRezervacije implements OnInit {
  predstojeceRezervacije: Rezervacija[] = [];
  istorija: Rezervacija[] = [];
  otkazane: Rezervacija[] = [];
  listaCekanja: ListaCekanja[] = [];
  activeTab = 'predstojeceRezervacije';
  loading = true;
  expandedId: number | null = null;

  constructor(
    private svc: RezervacijaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loading = true;
    const now = new Date();

    this.svc.getMoje().subscribe({
      next: (lista) => {
        this.predstojeceRezervacije = lista.filter(
          (r) => r.status === 'aktivna' && new Date(r.terminDatumVreme) >= now,
        );
        this.istorija = lista.filter(
          (r) => r.status === 'zavrsena' || (r.status === 'aktivna' && new Date(r.terminDatumVreme) < now),
        );
        this.otkazane = lista.filter((r) => r.status === 'otkazana');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.svc.getMojeListe().subscribe({
      next: (lista) => {
        this.listaCekanja = lista;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  otkazi(id: number) {
    this.svc.otkazi(id).subscribe({
      next: () => {
        this.expandedId = null;
        this.ngOnInit();
      },
      error: () => {},
    });
  }

  otkaziListu(id: number) {
    this.svc.otkaziListu(id).subscribe({
      next: () => {
        this.listaCekanja = this.listaCekanja.filter(l => l.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  toggleDetalji(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  get activeList(): Rezervacija[] {
    if (this.activeTab === 'predstojeceRezervacije') return this.predstojeceRezervacije;
    if (this.activeTab === 'istorija') return this.istorija;
    return this.otkazane;
  }

  getDayOfWeek(datum: string): string {
    return new Date(datum).toLocaleDateString('sr-Latn', { weekday: 'short' }).toUpperCase();
  }

  getStatusClass(status: string): string {
    if (status === 'aktivna') return 'tag-green';
    if (status === 'zavrsena') return 'tag-blue';
    return 'tag-red';
  }

  getStatusLabel(status: string): string {
    if (status === 'aktivna') return '● potvrđena';
    if (status === 'zavrsena') return '● stigla';
    return '● otkazana';
  }
}
