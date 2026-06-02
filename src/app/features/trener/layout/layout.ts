import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { NotifikacijaService } from '../../../core/services/notifikacija';
import { environment } from '../../../../environments/environment';
import { Trener } from '../../../core/models/models';

@Component({
  selector: 'app-trener-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit, OnDestroy {
  user: any = null;
  specijalizacija = '';

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private notifSvc: NotifikacijaService,
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.notifSvc.startPolling();

    const id = this.auth.currentUser?.id;
    if (id) {
      this.http.get<Trener>(`${environment.apiUrl}/treneri/${id}`).subscribe({
        next: (t) => (this.specijalizacija = t.specijalizacija),
        error: () => {},
      });
    }
  }

  ngOnDestroy() {
    this.notifSvc.stopPolling();
  }

  get initials(): string {
    if (!this.user) return 'T';
    return `${this.user.ime[0]}${this.user.prezime[0]}`;
  }

  logout() {
    this.auth.logout();
  }

  onActivate(component: any) {
    window.scrollTo(0, 0);
  }
}
