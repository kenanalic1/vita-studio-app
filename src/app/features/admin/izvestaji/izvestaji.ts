import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PregledService } from '../../../core/services/pregled';
import { Izvestaj } from '../../../core/models/models';

@Component({
  selector: 'app-izvestaji',
  standalone: false,
  templateUrl: './izvestaji.html',
  styleUrl: './izvestaji.scss',
})
export class Izvestaji implements OnInit {
  izvestaj: Izvestaj | null = null;
  selectedPeriod = 7;
  loading = true;

  constructor(
    private svc: PregledService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getIzvestaj(this.selectedPeriod).subscribe({
      next: (i) => {
        this.izvestaj = i;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setPeriod(m: number) {
    this.selectedPeriod = m;
    this.load();
  }

  formatPrihod(n: number): string {
    return n.toLocaleString('sr-RS') + ' RSD';
  }

  getBarWidth(value: number, max: number): number {
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }

  get maxPrihod(): number {
    if (!this.izvestaj) return 1;
    return Math.max(...this.izvestaj.prihodPoMesecima.map((p) => p.prihod));
  }

  exportPdf() {
    if (!this.izvestaj) return;
    const doc = new jsPDF();
    const datum = new Date().toLocaleDateString('sr-Latn', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

    // ---- Zaglavlje ----
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text('Vita Studio', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Izvestaj za period: ${this.selectedPeriod} meseci   |   Generisano: ${datum}`,
      14, 28,
    );

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 33, 196, 33);
    doc.setTextColor(0, 0, 0);

    // ---- Kljucne metrike ----
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Kljucne metrike', 14, 43);

    autoTable(doc, {
      startY: 47,
      head: [['Metrika', 'Vrednost']],
      body: [
        ['Ukupan prihod', this.formatPrihod(this.izvestaj.ukupanPrihod)],
        ['Prosecna popunjenost', `${this.izvestaj.prosecnaPopunjenost}%`],
        ['Retencija clanica', `${this.izvestaj.retencijaClanica}%`],
      ],
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    // ---- Prihod po mesecima ----
    let nextY = (doc as any).lastAutoTable.finalY + 14;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Prihod po mesecima', 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [['Mesec', 'Prihod (RSD)']],
      body: this.izvestaj.prihodPoMesecima.map((m) => [
        m.mesec.slice(0, 7),
        Number(m.prihod).toLocaleString('sr-RS'),
      ]),
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    // ---- Top aktivnosti ----
    nextY = (doc as any).lastAutoTable.finalY + 14;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top aktivnosti', 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [['Aktivnost', 'Popunjenost', 'Termina (mesec)']],
      body: this.izvestaj.topAktivnosti.map((a) => [
        a.naziv,
        `${a.popunjenost}%`,
        a.brojTermina.toString(),
      ]),
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
      margin: { left: 14, right: 14 },
    });

    // ---- Distribucija paketa ----
    nextY = (doc as any).lastAutoTable.finalY + 14;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribucija paketa', 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [['Tip paketa', 'Aktivnih clanica']],
      body: this.izvestaj.distribucijaPaketa.map((p) => [
        p.tipPaketa.charAt(0).toUpperCase() + p.tipPaketa.slice(1),
        p.brojAktivnih.toString(),
      ]),
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'center' } },
      margin: { left: 14, right: 14 },
    });

    // ---- Footer na svakoj stranici ----
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      doc.text(
        `Vita Studio  |  Strana ${i} od ${pageCount}`,
        pw / 2, ph - 8,
        { align: 'center' },
      );
    }

    const filename = `vita-studio-izvestaj-${this.selectedPeriod}m-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }
}
