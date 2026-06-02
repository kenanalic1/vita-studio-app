import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PregledService } from '../../../core/services/pregled';
import { AuthService } from '../../../core/services/auth';
import { AdminPregled } from '../../../core/models/models';

@Component({
  selector: 'app-admin-pregled',
  standalone: false,
  templateUrl: './pregled.html',
  styleUrl: './pregled.scss',
})
export class Pregled implements OnInit {
  pregled: AdminPregled | null = null;
  today = new Date();
  loading = true;

  constructor(
    private pregledSvc: PregledService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.pregledSvc.getAdminPregled().subscribe({
      next: (p) => {
        this.pregled = p;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.log('GREŠKA:', e);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get userName(): string {
    return this.auth.currentUser?.ime ?? '';
  }

  getPopunjenostPercent(rezerv: number, max: number): number {
    return max > 0 ? Math.round((rezerv / max) * 100) : 0;
  }

  getSlotClass(rezerv: number, max: number): string {
    if (rezerv >= max) return 'tag-red';
    if (rezerv / max > 0.75) return 'tag-yellow';
    return 'tag-green';
  }

  formatPrihod(n: number): string {
    return n.toLocaleString('sr-RS') + ' RSD';
  }
  showNoviTermin = false;

  onTerminSacuvan() {
    this.showNoviTermin = false;
    this.ngOnInit();
  }
}
