import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'vita_token';
  private readonly USER_KEY = 'vita_user';

  private _user$ = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  readonly user$ = this._user$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap((resp) => this.storeSession(resp)),
    );
  }

  register(dto: {
    ime: string; prezime: string; email: string; lozinka: string;
    telefon: string; datumRodjenja: string;
  }) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, dto);
  }

  private storeSession(resp: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, resp.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(resp));
    this._user$.next(resp);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user$.next(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): AuthResponse | null {
    return this._user$.getValue();
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get uloga(): string | null {
    return this.currentUser?.uloga ?? null;
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
