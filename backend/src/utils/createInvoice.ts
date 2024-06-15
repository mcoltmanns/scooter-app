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
    static async editPdf(rentalId : number, email: string, name:string, street: string, scooterName: string): Promise<Uint8Array> {

        /* variables for user data */
        const price_per_hour = 12.33;
        const rentalDuration = 3;
        const total = 12.33;
        
        const pdfPath = path.resolve(process.cwd(), 'img', 'pdf', 'Rechnung.pdf');

        // read the PDF file
        const existingPdfBytes = fs.readFileSync(pdfPath);
        // load pdf file
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
        const fontSizeHeader = 11;
    
        /* position for the texts  */
        const lineHeight = fontSize + 400;
        const currentYPosition = 100; // current y position
        const textWidth = timesRomanFont.widthOfTextAtSize(scooterName, fontSize);

        /* Data for User Header: */

        // add name into the pdf
        firstPage.drawText(rentalId.toString(), {
            x: 160,
            y: height + 166 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(email, {
            x: 160,
            y: height + 160 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(street, {
            x: 160,
            y: height + 150 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(name, {
            x: 160,
            y: height + 140 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add name into the pdf
        firstPage.drawText(scooterName, {
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
}