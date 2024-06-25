import { Request, Response } from 'express';
import { Rental } from '../models/rental';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { Op } from 'sequelize';
import { CreateInvoice } from '../utils/createInvoice'; 
import { UsersAuth } from '../models/user';
import { UsersData } from '../models/user';
import fs from 'fs';
import path from 'path';

export class BookingsController {

    constructor() {
        this.getUserRentals = this.getUserRentals.bind(this);
        this.getRentalProducts = this.getRentalProducts.bind(this);
        this.generateInvoice = this.generateInvoice.bind(this);
        this.fetchUserData = this.fetchUserData.bind(this);
    }

    /* Method that returns all entries from the Rentals table for a specific User_Id */
    public async getUserRentals(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }

        try {
            const rentals = await Rental.findAll({ where: { user_id: userId } });

            if (rentals.length === 0) {
                response.status(404).json({ code: 404, message: 'Keine Mietverträge gefunden.' });
                return;
            }

            response.status(200).json(rentals);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Mietverträge.' });
        }
    }

    /* Method taht return for all bookings the product + the scooterId from the scooter table */
    public async getRentalProducts(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cooki

        try {
            // Get all rental contracts of the user
            const rentals = await Rental.findAll({ where: { user_id: userId } });

            // / Extract the scooter IDs from the rental agreements
            const scooterIds = rentals.map(rental => rental.get('scooter_id'));

            
            // Search for the names of the scooters using their IDs in the scooter table
            const scooters = await Scooter.findAll({ 
                where: { id: { [Op.in]: scooterIds } },
                include: [{ model: Product }] // Include to retrieve the associated products
            });
            
            // Extract the names of the scooters found
            const scooterNames = scooters.map(scooter => scooter.get('product_id'));
            const products = await Product.findAll({ 
                where: { name: { [Op.in]: scooterNames } } 
            });

            const productsWithScooterId = products.map(product => {
                const scooterId = scooters.find(scooter => scooter.get('product_id') === product.get('name'))?.get('id');
                return { ...product.toJSON(), scooterId };
            });

            response.status(200).json(productsWithScooterId);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Produkte.' });
        }
    }

    /* method to get the information for the invoice pdf */
    public async generateInvoice(request: Request, response: Response): Promise<void> {
        const { rentalId, createdAt, endedAt, scooterName, total, duration, pricePerHour, selectedCurrency } = request.body;
        console.log(request.body);

        if (!rentalId) {
            response.status(400).json({ code: 400, message: 'Keine Miet-ID angegeben.' });
            return;
        }

        try {

            // search for a rental agreement using the rentalId
            const rental = await Rental.findOne({ where: { id: rentalId } });

            if (!rental) {
                response.status(404).json({ code: 404, message: 'Mietvertrag nicht gefunden.' });
                return;
            }

             // Fetch user data
             const userId = response.locals.userId;
             const userData = await this.fetchUserData(userId);
             if (!userData) {
                 response.status(404).json({ code: 404, message: 'Benutzerdaten nicht gefunden.' });
                 return;
             }

            // create PDF
            const pdfBytes = await CreateInvoice.editPdf(rentalId, userData.email, userData.name, userData.street, scooterName, total, duration, pricePerHour, createdAt, endedAt, selectedCurrency);

            // specify path to save the file
            const filePath = path.resolve(process.cwd(), 'img', 'pdf', 'InvoiceScooter.pdf');

            // write PDF to a new file
            fs.writeFile(filePath, pdfBytes, (err) => {
                if (err) {
                    console.error('Fehler beim Speichern der PDF-Datei:', err);
                    response.status(500).json({ code: 500, message: 'Fehler beim Speichern der PDF-Datei.' });
                    return;
                }
            });
            // send PDF as an answer
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', 'inline; filename="InvoiceScooter.pdf"');
            /*
            console.log(pdfBytes);
            response.send(pdfBytes);
            */
           response.end(pdfBytes, 'binary');

        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Erstellen der Rechnung.' });
        }
    }

    /* Private method to fetch user data based on rentalId */
    private async fetchUserData(userId: number): Promise<{ email: string, name: string, street: string }> {
        try {
            const userAuth = await UsersAuth.findOne({ where: { id: userId } });
            const userData = await UsersData.findOne({ where: { usersAuthId: userId } });

            if (!userAuth || !userData) {
                throw new Error('User not found');
            }

            return {
                email: `${userAuth.get('email')}`,
                name: `${userData.get('name')}`,
                street: `${userData.get('street')} ${userData.get('houseNumber')}`
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }
}