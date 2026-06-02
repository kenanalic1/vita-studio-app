import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth';

interface Ucesnica {
  clanId: number;
  imePrezime: string;
  email: string;
  brojSesija: number;
  aktivnosti: string[];
  poslednjiTermin: string;
}

@Component({
  selector: 'app-ucesnice',
  standalone: false,
  templateUrl: './ucesnice.html',
  styleUrl: './ucesnice.scss',
})
export class Ucesnice implements OnInit {
  ucesnice: Ucesnica[] = [];
  searchTerm = '';
  loading = true;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.auth.currentUser?.id ?? 0;
    this.http.get<Ucesnica[]>(`${environment.apiUrl}/treneri/${id}/ucesnice`).subscribe({
      next: (data) => {
        this.ucesnice = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filtered(): Ucesnica[] {
    if (!this.searchTerm) return this.ucesnice;
    const q = this.searchTerm.toLowerCase();
    return this.ucesnice.filter(u =>
      u.imePrezime.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    );
  }

  get ukupnoUcesnica(): number {
    return this.ucesnice.length;
  }

  get ukupnoSesija(): number {
    return this.ucesnice.reduce((s, u) => s + u.brojSesija, 0);
  }

  getInitials(ime: string): string {
    const parts = ime.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : ime[0];
  }

  getAktivnostColor(naziv: string): string {
    const map: Record<string, string> = {
      'Joga': '#f5f0ff', 'Pilates': '#fdf2f8',
      'Aerobik': '#fff7ed', 'Zumba': '#fefce8',
      'Stretching': '#f0fdf4', 'Barre': '#fdf2f8',
    };
    for (const key of Object.keys(map)) {
      if (naziv.toLowerCase().includes(key.toLowerCase())) return map[key];
    }
    return '#f3f4f6';
  }
}
