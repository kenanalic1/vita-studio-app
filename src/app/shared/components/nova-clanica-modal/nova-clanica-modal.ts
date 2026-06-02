import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nova-clanica-modal',
  standalone: false,
  templateUrl: './nova-clanica-modal.html',
  styleUrl: './nova-clanica-modal.scss',
})
export class NovaClanicaModal {
  @Output() zatvori = new EventEmitter<void>();
  @Output() sacuvano = new EventEmitter<void>();

  form: FormGroup;
  saving = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      ime: ['', Validators.required],
      prezime: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lozinka: ['', [Validators.required, Validators.minLength(6)]],
      telefon: ['', Validators.required],
      datumRodjenja: ['', Validators.required],
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';

    this.http.post(`${environment.apiUrl}/clanice`, this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.sacuvano.emit();
        this.zatvori.emit();
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.saving = false;
        this.errorMsg = e.error?.message ?? 'Greška pri čuvanju.';
        this.cdr.detectChanges();
      },
    });
  }
}
