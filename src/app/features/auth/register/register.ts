import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

function lozinkeSePodudaraju(form: AbstractControl): ValidationErrors | null {
  const l = form.get('lozinka')?.value;
  const p = form.get('potvrdaLozinke')?.value;
  return l && p && l !== p ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  form!: FormGroup;
  loading = false;
  errorMsg = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) this.router.navigate(['/clan']);
    this.form = this.fb.group({
      ime:            ['', Validators.required],
      prezime:        ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      telefon:        ['', Validators.required],
      datumRodjenja:  ['', Validators.required],
      lozinka:        ['', [Validators.required, Validators.minLength(6)]],
      potvrdaLozinke: ['', Validators.required],
    }, { validators: lozinkeSePodudaraju });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading  = true;
    this.errorMsg = '';
    const v = this.form.value;
    this.auth.register({
      ime:           v.ime,
      prezime:       v.prezime,
      email:         v.email,
      lozinka:       v.lozinka,
      telefon:       v.telefon,
      datumRodjenja: new Date(v.datumRodjenja).toISOString(),
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (e) => {
        this.loading  = false;
        this.errorMsg = e.error?.message ?? 'Greška pri registraciji. Pokušaj ponovo.';
      },
    });
  }

  get mismatch(): boolean {
    return !!this.form.errors?.['mismatch'] &&
      !!this.form.get('potvrdaLozinke')?.touched;
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!c?.invalid && !!c?.touched;
  }
}
