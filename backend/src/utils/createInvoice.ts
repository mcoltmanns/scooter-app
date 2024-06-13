import { PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * creates a invoice pdf for a scooter booking
 */
export class CreateInvoice {

    /**
     * edits pdf file with scooter information
     * @returns 
     */
    static async editPdf(): Promise<Uint8Array> {

        /* variables for user data */
        const name = 'Swift Stream - Art Nuveau Edition';
        const price_per_hour = 12.33;
        const rentalDuration = 3;
        const total = 12.33;
        
        const pdfPath = path.resolve(process.cwd(), 'src', 'utils', 'Rechnung.pdf');

        // Read the PDF file
        const existingPdfBytes = fs.readFileSync(pdfPath);

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        /* create date when the invoice is created */
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // +1 because getMonth() is zero based
        const day = today.getDate();
        const currentDate =  day + '.' + month + '.' + year;
        console.log(currentDate);

        /* get first pdf page */
        const firstPage = pdfDoc.getPage(0);
        const { height } = firstPage.getSize();
    
        /* add fonts */
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 9;
    
        const lineHeight = fontSize + 400;
        const currentYPosition = 170; // current y position
        const textWidth = timesRomanFont.widthOfTextAtSize(name, fontSize);

        // add name into the pdf
        firstPage.drawText(name, {
        x: 140 - (textWidth / 2),
        y: height - currentYPosition - lineHeight, // Positionierung von oben nach unten
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
        });

        // add price_per_hour into the pdf
        firstPage.drawText(price_per_hour.toString(), {
            x: 240,
            y: height - currentYPosition - lineHeight, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add rental duartion into the pdf
        firstPage.drawText(rentalDuration.toString(), {
            x: 360,
            y: height - currentYPosition - lineHeight, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add total price into the pdf
        firstPage.drawText(total.toString(), {
            x: 450,
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