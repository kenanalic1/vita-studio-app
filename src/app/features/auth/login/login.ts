import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  form!: FormGroup;
  selectedRole: 'clan' | 'trener' | 'administrator' = 'clan';
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.redirectByRole(this.auth.uloga!);
    }
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      lozinka: ['', Validators.required],
    });
  }

  selectRole(role: 'clan' | 'trener' | 'administrator') {
    this.selectedRole = role;
    this.errorMsg = '';
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { email, lozinka } = this.form.value;
    this.auth.login({ email, lozinka, uloga: this.selectedRole }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.redirectByRole(resp.uloga);
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg = e.error?.message ?? 'Pogrešan email ili lozinka.';
      },
    });
  }

  private redirectByRole(uloga: string) {
    if (uloga === 'administrator') this.router.navigate(['/admin']);
    else if (uloga === 'trener') this.router.navigate(['/trener']);
    else this.router.navigate(['/clan']);
  }
}
