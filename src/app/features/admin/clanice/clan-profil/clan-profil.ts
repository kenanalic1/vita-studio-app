import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ClanProfil as ClanProfilModel } from '../../../../core/models/models';

@Component({
  selector: 'app-clan-profil',
  standalone: false,
  templateUrl: './clan-profil.html',
  styleUrl: './clan-profil.scss',
})
export class ClanProfil implements OnInit {
  profil: ClanProfilModel | null = null;
  loading = true;
  editMode = false;
  saving = false;
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<ClanProfilModel>(`${environment.apiUrl}/clanice/${id}`).subscribe({
      next: (p) => {
        this.profil = p;
        this.form = this.fb.group({
          ime:           [p.ime,           Validators.required],
          prezime:       [p.prezime,       Validators.required],
          email:         [p.email,         [Validators.required, Validators.email]],
          telefon:       [p.telefon,       Validators.required],
          datumRodjenja: [p.datumRodjenja?.slice(0, 10), Validators.required],
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

  saveEdit() {
    if (!this.profil || this.form.invalid) return;
    this.saving = true;
    this.http.put(`${environment.apiUrl}/clanice/${this.profil.id}`, this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.editMode = false;
        this.ngOnInit();
      },
      error: (e) => {
        this.saving = false;
        alert(e.error?.message ?? 'Greška pri čuvanju.');
        this.cdr.detectChanges();
      },
    });
  }

  get mailtoLink(): string {
    return this.profil ? `mailto:${this.profil.email}` : '#';
  }

  get daysLeft(): number {
    if (!this.profil?.aktivnaClanarina) return -1;
    return Math.floor(
      (new Date(this.profil.aktivnaClanarina.datumIsteka).getTime() - Date.now()) / 86400000,
    );
  }

  get clanarinaStatus(): 'aktivna' | 'istice' | 'istekla' | 'nema' {
    if (!this.profil?.aktivnaClanarina) return 'nema';
    if (this.daysLeft < 0) return 'istekla';
    if (this.daysLeft <= 7) return 'istice';
    return 'aktivna';
  }

  get clanarinaStatusLabel(): string {
    switch (this.clanarinaStatus) {
      case 'aktivna':  return '● aktivna';
      case 'istice':   return '● ističe';
      case 'istekla':  return '● istekla';
      default:         return '● bez članarine';
    }
  }

  get clanarinaStatusClass(): string {
    switch (this.clanarinaStatus) {
      case 'aktivna':  return 'tag-green';
      case 'istice':   return 'tag-yellow';
      default:         return 'tag-red';
    }
  }

  nazad() {
    this.router.navigate(['/admin/clanice']);
  }
  showProduzi = false;

  onClanarinarSacuvana() {
    this.showProduzi = false;
    this.ngOnInit();
  }
}
