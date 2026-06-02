import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifikacijaService } from '../../../core/services/notifikacija';
import { Notifikacija } from '../../../core/models/models';

@Component({
  selector: 'app-notifikacije',
  standalone: false,
  templateUrl: './notifikacije.html',
  styleUrl: './notifikacije.scss',
})
export class NotifikacijeComponent implements OnInit, OnDestroy {
  notifikacije: Notifikacija[] = [];
  broj = 0;
  open = false;
  private subs: Subscription[] = [];

  constructor(private svc: NotifikacijaService) {}

  ngOnInit() {
    this.subs.push(
      this.svc.notifikacije$.subscribe(n => this.notifikacije = n),
      this.svc.broj$.subscribe(b => this.broj = b),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggle() {
    this.open = !this.open;
    if (this.open && this.broj > 0) {
      this.svc.procitajSve();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('app-notifikacije')) {
      this.open = false;
    }
  }

  timeAgo(datum: string): string {
    const diff = Date.now() - new Date(datum).getTime();
    const min  = Math.floor(diff / 60000);
    if (min < 1)   return 'Upravo';
    if (min < 60)  return `Prije ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24)    return `Prije ${h} h`;
    return `Prije ${Math.floor(h / 24)} d`;
  }
}
