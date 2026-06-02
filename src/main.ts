import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

platformBrowser()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true,
    ngZoneRunCoalescing: true,
  })
  .catch((err) => console.error(err));
