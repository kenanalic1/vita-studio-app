import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Aktivnost } from '../../../core/models/models';

@Component({
  selector: 'app-nova-aktivnost-modal',
  standalone: false,
  templateUrl: './nova-aktivnost-modal.html',
  styleUrl: './nova-aktivnost-modal.scss',
})
export class NovaAktivnostModal implements OnInit {
  @Input() aktivnostEdit: Aktivnost | null = null;
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
      naziv: ['', Validators.required],
      opis: [''],
      tipAktivnosti: ['grupni', Validators.required],
    });
  }

  ngOnInit() {
    if (this.aktivnostEdit) {
      this.form.patchValue({
        naziv: this.aktivnostEdit.naziv,
        opis: this.aktivnostEdit.opis ?? '',
        tipAktivnosti: this.aktivnostEdit.tipAktivnosti,
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';

    const req = this.aktivnostEdit
      ? this.http.put(`${environment.apiUrl}/aktivnosti/${this.aktivnostEdit.id}`, this.form.value)
      : this.http.post(`${environment.apiUrl}/aktivnosti`, this.form.value);

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
