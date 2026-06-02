import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Clan, Clanarina } from '../../../core/models/models';

@Component({
  selector: 'app-produzi-clanarina-modal',
  standalone: false,
  templateUrl: './produzi-clanarina-modal.html',
  styleUrl: './produzi-clanarina-modal.scss',
})
export class ProduziClanarinaModal implements OnInit {
  @Input() clanId: number | null = null;
  @Input() aktivnaClanarina: Clanarina | null = null;
  @Input() defaultTipPaketa: string = 'mesecna';
  @Input() defaultCena: number = 3000;
  @Input() defaultNaziv: string = '';
  @Output() zatvori = new EventEmitter<void>();
  @Output() sacuvano = new EventEmitter<void>();

  form!: FormGroup;
  saving = false;
  errorMsg = '';
  clanice: Clan[] = [];

  private readonly trajanjeDana: Record<string, number> = {
    mesecna: 30, kvartalna: 90, godisnja: 365, posebna: 30,
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const tip = this.aktivnaClanarina?.tipPaketa ?? this.defaultTipPaketa;
    const pocetakStr = new Date().toISOString().split('T')[0];
    const istekStr = this.calcIsteka(pocetakStr, tip);

    this.form = this.fb.group({
      clanIdSelect: [this.clanId ?? null, this.clanId == null ? Validators.required : []],
      tipPaketa:    [tip, Validators.required],
      nazivPaketa:  [this.aktivnaClanarina?.nazivPaketa ?? this.defaultNaziv, Validators.required],
      datumPocetka: [pocetakStr, Validators.required],
      datumIsteka:  [istekStr, Validators.required],
      cena:         [this.aktivnaClanarina?.cena ?? this.defaultCena, [Validators.required, Validators.min(0)]],
    });

    if (this.clanId == null) {
      this.http.get<Clan[]>(`${environment.apiUrl}/clanice`).subscribe({
        next: (lista) => { this.clanice = lista; this.cdr.detectChanges(); },
      });
    }
  }

  onTipChange() {
    const tip = this.form.value.tipPaketa;
    const pocetakStr = this.form.value.datumPocetka;
    this.form.patchValue({ datumIsteka: this.calcIsteka(pocetakStr, tip) });
  }

  onPocetakChange() {
    const tip = this.form.value.tipPaketa;
    const pocetakStr = this.form.value.datumPocetka;
    this.form.patchValue({ datumIsteka: this.calcIsteka(pocetakStr, tip) });
  }

  private calcIsteka(pocetakStr: string, tip: string): string {
    const d = new Date(pocetakStr);
    d.setDate(d.getDate() + (this.trajanjeDana[tip] ?? 30));
    return d.toISOString().split('T')[0];
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';
    const v = this.form.value;
    const dto = {
      tipPaketa:    v.tipPaketa,
      nazivPaketa:  v.nazivPaketa,
      datumPocetka: v.datumPocetka,
      datumIsteka:  v.datumIsteka,
      cena:         v.cena,
      clanId:       this.clanId ?? v.clanIdSelect,
    };
    this.http.post(`${environment.apiUrl}/clanarine`, dto).subscribe({
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
