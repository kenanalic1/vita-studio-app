import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Rezervacija } from '../../../core/models/models';
import { NotifikacijaService } from '../../../core/services/notifikacija';

@Component({
  selector: 'app-clan-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit, OnDestroy {
  user: any = null;
  brRezervacija = 0;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private notifSvc: NotifikacijaService,
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.http.get<Rezervacija[]>(`${environment.apiUrl}/rezervacije/moje`).subscribe({
      next: (lista) => {
        const now = new Date();
        this.brRezervacija = lista.filter(
          (r) => r.status === 'aktivna' && new Date(r.terminDatumVreme) >= now,
        ).length;
      },
      error: () => {},
    });
    this.notifSvc.startPolling();
  }

  ngOnDestroy() {
    this.notifSvc.stopPolling();
  }

  get initials(): string {
    if (!this.user) return 'C';
    return `${this.user.ime[0]}${this.user.prezime[0]}`;
  }

  logout() {
    this.auth.logout();
  }
  onActivate(component: any) {
    window.scrollTo(0, 0);
  }
}
