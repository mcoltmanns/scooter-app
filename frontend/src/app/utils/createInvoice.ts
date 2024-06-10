import { PDFDocument, rgb, StandardFonts} from 'pdf-lib';

/**
 * creates a invoice pdf for a scooter booking
 */
export class CreateInvoice {

    /**
     * edits pdf file with scooter information
     * @returns 
     */
    static async editPdf(): Promise<Uint8Array> {
        
        const existingPdfBytes = await fetch('/assets/Rechnung.pdf').then(res => res.arrayBuffer()); // load the existing PDF file
    
        const pdfDoc = await PDFDocument.load(existingPdfBytes); // load pdf document
    
        /* get first pdf page */
        const firstPage = pdfDoc.getPage(0);
        const { height } = firstPage.getSize();
    
        /* add fonts */
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 12;
    
        const name = 'Nimbus 2000';
        const lineHeight = fontSize + 400;
        const currentYPosition = 40; // Adjust this value as needed for proper positioning

        // Add name into the pdf
        firstPage.drawText(name, {
        x: 50,
        y: height - currentYPosition - lineHeight, // Positionierung von oben nach unten
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
        });
        return await pdfDoc.save(); // Save the edited pdf file
    }


    /**
     * downloads pdf file
     * @param bytes 
     * @param filename 
     */
    static download(bytes: Uint8Array, filename: string): void {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }    
}