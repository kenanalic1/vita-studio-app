import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Sala } from '../../../core/models/models';

@Component({
  selector: 'app-nova-sala-modal',
  standalone: false,
  templateUrl: './nova-sala-modal.html',
  styleUrl: './nova-sala-modal.scss',
})
export class NovaSalaModal implements OnInit {
  @Input() salaEdit: Sala | null = null;
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
      kapacitet: ['', [Validators.required, Validators.min(1)]],
      tip: ['sala', Validators.required],
    });
  }

  ngOnInit() {
    if (this.salaEdit) {
      this.form.patchValue({
        naziv: this.salaEdit.naziv,
        kapacitet: this.salaEdit.kapacitet,
        tip: this.salaEdit.tip,
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';

    const req = this.salaEdit
      ? this.http.put(`${environment.apiUrl}/sale/${this.salaEdit.id}`, this.form.value)
      : this.http.post(`${environment.apiUrl}/sale`, this.form.value);

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
