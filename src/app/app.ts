import { Component, ApplicationRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App {
  title = 'vita-studio-app';

  constructor(
    private router: Router,
    private appRef: ApplicationRef,
  ) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      setTimeout(() => {
        this.appRef.tick();
      }, 50);
    });
  }
}
