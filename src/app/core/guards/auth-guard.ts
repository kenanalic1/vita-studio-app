import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }
    const allowedRoles = route.data['roles'] as string[] | undefined;
    if (allowedRoles && !allowedRoles.includes(this.auth.uloga ?? '')) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
