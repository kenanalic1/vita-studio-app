import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PregledService } from '../../../core/services/pregled';
import { AuthService } from '../../../core/services/auth';
import { TrenerPregled, Rezervacija } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-trener-pregled',
  standalone: false,
  templateUrl: './pregled.html',
  styleUrl: './pregled.scss',
})
export class Pregled implements OnInit {
  pregled: TrenerPregled | null = null;
  today = new Date();
  loading = true;

  expandedTerminId: number | null = null;
  terminParticipants = new Map<number, Rezervacija[]>();
  loadingExp = new Set<number>();

  constructor(
    private svc: PregledService,
    private auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.auth.currentUser?.id ?? 0;
    this.svc.getTrenerPregled(id).subscribe({
      next: (p) => {
        this.pregled = p;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleUcesnice(terminId: number) {
    if (this.expandedTerminId === terminId) {
      this.expandedTerminId = null;
      return;
    }
    this.expandedTerminId = terminId;
    if (this.terminParticipants.has(terminId)) {
      return;
    }
    this.loadingExp.add(terminId);
    this.http.get<Rezervacija[]>(`${environment.apiUrl}/rezervacije/termin/${terminId}`).subscribe({
      next: (lista) => {
        this.terminParticipants.set(terminId, lista.filter(r => r.status === 'aktivna'));
        this.loadingExp.delete(terminId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.terminParticipants.set(terminId, []);
        this.loadingExp.delete(terminId);
        this.cdr.detectChanges();
      },
    });
  }

  getUcesnice(terminId: number): Rezervacija[] {
    return this.terminParticipants.get(terminId) ?? [];
  }

  getInitials(ime: string): string {
    const parts = ime.trim().split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : ime[0];
  }

  get userName(): string {
    return this.auth.currentUser?.ime ?? '';
  }

  getBarColor(naziv: string): string {
    const colors: Record<string, string> = {
      'Vinyasa Flow': '#a78bfa',
      'Yin Joga': '#6ee7b7',
      'Pilates Mat': '#fca5a5',
      Aerobik: '#fcd34d',
    };
    return colors[naziv] ?? '#c4b5fd';
  }

  isCompleted(datumVreme: string): boolean {
    return new Date(datumVreme) < new Date();
  }

  getPercent(rez: number, max: number): number {
    return max > 0 ? Math.round((rez / max) * 100) : 0;
  }
}
