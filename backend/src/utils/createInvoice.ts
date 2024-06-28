import { PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * creates a invoice pdf for a scooter booking
 */
export class CreateInvoice {

    /**
     * edits pdf file with scooter information
     * @param rentalId 
     * @param email 
     * @param name 
     * @param street 
     * @param scooterName 
     * @param total 
     * @param duration 
     * @param pricePerHour 
     * @param createdAt 
     * @param endedAt 
     * @param selectedCurrency
     * @returns 
     */
    static async editPdf(rentalId : number, email: string, name:string, street: string, scooterName: string, total: string, price_per_hour: string, createdAt: string, endedAt: string, selectedCurrency: string): Promise<Uint8Array> {
        
        // path to get prefilled pdf
        const pdfPath = path.resolve(process.cwd(), 'img', 'pdf', 'Rechnung.pdf');

        // read and load th pdf file 
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        /* Convert Currency */

        /* create date when the invoice is created */
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // +1 because getMonth() is zero based and pad with leading zero if needed
        const day = String(today.getDate()).padStart(2, '0'); // pad with leading zero if needed
        const currentDate = `${day}.${month}.${year}`;

        /* calculate the rental duration */
        const duration = this.calculateDuration(createdAt, endedAt);

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
        selectedCurrency = ' '+selectedCurrency;

        /* Data for User Header: */

        // add name into the pdf
        firstPage.drawText(rentalId.toString(), {
            x: 160,
            y: height + 166 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add current date into the pdf
        firstPage.drawText(currentDate, {
            x: 160,
            y: height + 151 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add name of customer
        firstPage.drawText(name, {
            x: 160,
            y: height + 137 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add email
        firstPage.drawText(email, {
            x: 160,
            y: height + 123 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add adress of the costumer
        firstPage.drawText(street, {
            x: 160,
            y: height + 108 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        /* Add booking dates into pdf */
        
        // add craetedAt
        firstPage.drawText(this.formatDateTime(createdAt), {
            x: 184,
            y: height + 38 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add endedAt
        firstPage.drawText(this.formatDateTime(endedAt), {
            x: 224,
            y: height + 17 - lineHeight,
            size: fontSizeHeader,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        /* Add Scooter Data to the PDF: */

        // add scooter name into the pdf
        firstPage.drawText(scooterName, {
        x: 130 - (textWidth / 2),
        y: height - currentYPosition - lineHeight -25,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
        });

        // add price_per_hour into the pdf
        firstPage.drawText((price_per_hour.toString() + selectedCurrency), {
            x: 250,
            y: height - currentYPosition - lineHeight - 25,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add rental duartion into the pdf
        firstPage.drawText(duration.toString(), {
            x: 380,
            y: height - currentYPosition - lineHeight - 25, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add total price into the pdf
        firstPage.drawText((total.toString()), {
            x: 475,
            y: height - currentYPosition - lineHeight - 25, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add total price and Mwst:

        // add Nettobetrag price into the pdf
        firstPage.drawText((this.calculateNettoValue(parseFloat(total)) + selectedCurrency), {
            x: 475,
            y: height - currentYPosition - lineHeight - 69, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add Mwst price into the pdf
        firstPage.drawText((this.calculateMwst(parseFloat(total)) + selectedCurrency), {
            x: 475,
            y: height - currentYPosition - lineHeight - 84, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // add total price into the pdf
        firstPage.drawText((total.toString()), {
            x: 475,
            y: height - currentYPosition - lineHeight - 104, // Positionierung von oben nach unten
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // generate QR Code
        const qrCodeDataUrl = await QRCode.toDataURL('http://localhost:4200/booking');
        const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
        const qrDims = qrImage.scale(0.5);

        // add QR Code to PDF
        firstPage.drawImage(qrImage, {
            x: firstPage.getWidth() - qrDims.width - 83,
            y: height - currentYPosition - lineHeight - 223,
            width: qrDims.width,
            height: qrDims.height,
        });


        return await pdfDoc.save(); // Save the edited pdf file
    }

    /* Format the date time */
    private static formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.20${year}  ${hours}:${minutes} Uhr`;
    }

    /* calculates netto value of price */
    private static calculateNettoValue(total: number): string {
        const netValue = total / 1.19;
        return netValue.toFixed(2);
    }
    
    /* calculates Mwst value of price */
    private static calculateMwst(total: number): string {
        const netValue = total / 1.19;
        const mwstValue = total - netValue; 
        return mwstValue.toFixed(2); 
    }

    /**
     * Calculates the duration between two date-time strings in hours and minutes
     * @param createdAt - The start date-time string (e.g., '2024-06-10T15:53:51.998Z')
     * @param endedAt - The end date-time string
     * @returns The duration in hours and minutes as a string (e.g., '2h 30m')
     */
    private static calculateDuration(createdAt: string, endedAt: string): string {
        const startDate = new Date(createdAt);
        const endDate = new Date(endedAt);

        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHours}h ${diffMinutes}min`;
    }

}