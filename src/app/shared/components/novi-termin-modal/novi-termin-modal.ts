import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Aktivnost, Termin, Trener, Sala } from '../../../core/models/models';

@Component({
  selector: 'app-novi-termin-modal',
  standalone: false,
  templateUrl: './novi-termin-modal.html',
  styleUrl: './novi-termin-modal.scss',
})
export class NoviTerminModal implements OnInit {
  @Input() terminEdit: Termin | null = null;
  @Output() zatvori = new EventEmitter<void>();
  @Output() sacuvano = new EventEmitter<void>();

  form!: FormGroup;
  aktivnosti: Aktivnost[] = [];
  treneri: Trener[] = [];
  sale: Sala[] = [];
  saving = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      datumVreme: ['', Validators.required],
      trajanje: [60, [Validators.required, Validators.min(1)]],
      maxKapacitet: [16, [Validators.required, Validators.min(1)]],
      aktivnostId: ['', Validators.required],
      trenerId: ['', Validators.required],
      salaId: ['', Validators.required],
    });

    if (this.terminEdit) {
      const dt = new Date(this.terminEdit.datumVreme);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      this.form.patchValue({
        datumVreme: local,
        trajanje: this.terminEdit.trajanje,
        maxKapacitet: this.terminEdit.maxKapacitet,
        aktivnostId: this.terminEdit.aktivnostId,
        trenerId: this.terminEdit.trenerId,
        salaId: this.terminEdit.salaId,
      });
    }

    this.http.get<Aktivnost[]>(`${environment.apiUrl}/aktivnosti`).subscribe({
      next: (a) => {
        this.aktivnosti = a;
        this.cdr.detectChanges();
      },
    });
    this.http.get<Trener[]>(`${environment.apiUrl}/treneri`).subscribe({
      next: (t) => {
        this.treneri = t;
        this.cdr.detectChanges();
      },
    });
    this.http.get<Sala[]>(`${environment.apiUrl}/sale`).subscribe({
      next: (s) => {
        this.sale = s;
        this.cdr.detectChanges();
      },
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';

    const val = this.form.value;
    const dto = {
      datumVreme: new Date(val.datumVreme).toISOString(),
      trajanje: +val.trajanje,
      maxKapacitet: +val.maxKapacitet,
      aktivnostId: +val.aktivnostId,
      trenerId: +val.trenerId,
      salaId: +val.salaId,
    };

    const req = this.terminEdit
      ? this.http.put(`${environment.apiUrl}/termini/${this.terminEdit.id}`, dto)
      : this.http.post(`${environment.apiUrl}/termini`, dto);

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
