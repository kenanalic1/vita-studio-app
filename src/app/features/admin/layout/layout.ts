import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NotifikacijaService } from '../../../core/services/notifikacija';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit, OnDestroy {
  user: any = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifSvc: NotifikacijaService,
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.notifSvc.startPolling();
  }

  ngOnDestroy() {
    this.notifSvc.stopPolling();
  }

  get initials(): string {
    if (!this.user) return 'A';
    return `${this.user.ime[0]}${this.user.prezime[0]}`;
  }

  logout() {
    this.auth.logout();
  }
  onActivate(component: any) {
    window.scrollTo(0, 0);
  }
}
