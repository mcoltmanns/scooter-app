import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { SampleService } from 'src/app/services/sample.service';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';

@Component({
  standalone: true,
  selector: 'app-todo',
  imports: [BackButtonComponent, UserInputComponent, CommonModule, ButtonComponent],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  constructor(public sampleService: SampleService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // TESTEN OB DIE ÜBERGABE MIT DEN PARAMETERN KLAPPT
  }

  async onSubmit(): Promise<void> {
    console.log('button clicked');
    /*
    try {
      const editedPdfBytes = await this.editPdf();
      this.download(editedPdfBytes, 'bearbeiteteRechnung.pdf');
      console.log('bearbeiteteRechnung.pdf wurde erfolgreich erstellt.');
    } catch (error) {
      console.error('Error editing PDF:', error);
    }
    */
  }

  async editPdf(): Promise<Uint8Array> {
    // Lade die vorhandene PDF-Datei (hier als ArrayBuffer)
    const existingPdfBytes = await fetch('/assets/test.pdf').then(res => res.arrayBuffer());

    // Lade das PDF-Dokument
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Erstelle eine Seite (füge Inhalte zur ersten Seite hinzu)
    let [firstPage] = pdfDoc.getPages();
    const { height } = firstPage.getSize();

    // Schriftarten hinzufügen
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Rechnungsdetails hinzufügen
    const fontSize = 12;
    const textYPosition = height - 100;
    const lineHeight = fontSize + 4;
    const items = [
      { description: 'Scooter Model A', quantity: 1, price: 300 },
      { description: 'Helmet', quantity: 1, price: 50 },
      { description: 'Service Fee', quantity: 1, price: 20 },
    ];

    let currentYPosition = textYPosition;

    items.forEach(item => {
      // Überprüfe, ob der Text auf die aktuelle Seite passt
      if (currentYPosition - lineHeight < 50) {
        // Wenn nicht, füge eine neue Seite hinzu
        const newPage = pdfDoc.addPage(PageSizes.A4);
        firstPage = newPage;
        currentYPosition = height - 50;
      }

      firstPage.drawText(`${item.description} - ${item.quantity} x $${item.price}`, {
        x: 50,
        y: currentYPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      currentYPosition -= lineHeight;
    });

    currentYPosition -= lineHeight * 150;
    // Gesamtpreis berechnen und anzeigen
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Überprüfe erneut, ob der "Total" Text auf die aktuelle Seite passt
    if (currentYPosition - lineHeight < 50) {
      // Wenn nicht, füge eine neue Seite hinzu
      const newPage = pdfDoc.addPage(PageSizes.A4);
      firstPage = newPage;
      currentYPosition = height - 50;
    }

    firstPage.drawText(`Total: $${totalPrice}`, {
      x: 50,
      y: currentYPosition - lineHeight,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    // Speichere die bearbeitete PDF-Datei
    return await pdfDoc.save();
  }

  download(bytes: Uint8Array, filename: string): void {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}