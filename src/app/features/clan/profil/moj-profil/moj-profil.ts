import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth';
import { ClanProfil } from '../../../../core/models/models';

@Component({
  selector: 'app-moj-profil',
  standalone: false,
  templateUrl: './moj-profil.html',
  styleUrl: './moj-profil.scss',
})
export class MojProfil implements OnInit {
  profil: ClanProfil | null = null;
  form!: FormGroup;
  lozinkaForm!: FormGroup;
  loading = true;
  editMode = false;
  saving = false;
  showLozinka = false;
  savingLozinka = false;
  lozinkaError = '';
  lozinkaSuccess = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.auth.currentUser?.id ?? 0;
    this.http.get<ClanProfil>(`${environment.apiUrl}/clanice/${id}`).subscribe({
      next: (p) => {
        this.profil = p;
        this.form = this.fb.group({
          ime:           [p.ime,      Validators.required],
          prezime:       [p.prezime,  Validators.required],
          email:         [p.email,    [Validators.required, Validators.email]],
          telefon:       [p.telefon,  Validators.required],
          datumRodjenja: [p.datumRodjenja ? new Date(p.datumRodjenja).toISOString().split('T')[0] : '', Validators.required],
        });
        this.lozinkaForm = this.fb.group({
          staraLozinka: ['', Validators.required],
          novaLozinka:  ['', [Validators.required, Validators.minLength(6)]],
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get initials(): string {
    if (!this.profil) return '';
    return `${this.profil.ime[0]}${this.profil.prezime[0]}`;
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const id = this.auth.currentUser?.id ?? 0;
    const val = this.form.value;
    this.http.put(`${environment.apiUrl}/clanice/${id}`, {
      ...val,
      datumRodjenja: new Date(val.datumRodjenja).toISOString(),
    }).subscribe({
      next: () => {
        if (this.profil) {
          this.profil.ime      = val.ime;
          this.profil.prezime  = val.prezime;
          this.profil.email    = val.email;
          this.profil.telefon  = val.telefon;
        }
        this.saving   = false;
        this.editMode = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  promijeniLozinku() {
    if (this.lozinkaForm.invalid) return;
    this.savingLozinka = true;
    this.lozinkaError  = '';
    this.lozinkaSuccess = false;
    const id  = this.auth.currentUser?.id ?? 0;
    const val = this.lozinkaForm.value;
    this.http.put(`${environment.apiUrl}/clanice/${id}/lozinka`, {
      staraLozinka: val.staraLozinka,
      novaLozinka:  val.novaLozinka,
    }).subscribe({
      next: () => {
        this.savingLozinka  = false;
        this.lozinkaSuccess = true;
        this.lozinkaForm.reset();
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.savingLozinka = false;
        this.lozinkaError  = e.error?.message ?? 'Greška pri promjeni lozinke.';
        this.cdr.detectChanges();
      },
    });
  }
}
