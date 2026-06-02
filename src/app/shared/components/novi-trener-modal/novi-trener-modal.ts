import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Trener } from '../../../core/models/models';

@Component({
  selector: 'app-novi-trener-modal',
  standalone: false,
  templateUrl: './novi-trener-modal.html',
  styleUrl: './novi-trener-modal.scss',
})
export class NoviTrenerModal implements OnInit {
  @Input() trenerEdit: Trener | null = null;
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
      specijalizacija: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.trenerEdit) {
      this.form.patchValue({
        ime: this.trenerEdit.ime,
        prezime: this.trenerEdit.prezime,
        email: this.trenerEdit.email,
        telefon: this.trenerEdit.telefon,
        specijalizacija: this.trenerEdit.specijalizacija,
        lozinka: '',
      });
      this.form.get('lozinka')!.setValidators((control) => {
        if (!control.value) return null;
        return control.value.length < 6 ? { minlength: { requiredLength: 6 } } : null;
      });
      this.form.get('lozinka')!.updateValueAndValidity();
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';

    const req = this.trenerEdit
      ? this.http.put(`${environment.apiUrl}/treneri/${this.trenerEdit.id}`, this.form.value)
      : this.http.post(`${environment.apiUrl}/treneri`, this.form.value);

    req.subscribe({
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
