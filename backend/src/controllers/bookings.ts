import { Request, Response } from 'express';
import ReservationManager from '../services/reservation-manager';
import RentalManager from '../services/rental-manager';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { Op } from 'sequelize';
import { CreateInvoice } from '../utils/createInvoice'; 
import { UsersAuth } from '../models/user';
import { UsersData } from '../models/user';

// manages information about rentals and reservations
export class BookingsController {

    constructor() {
        this.getUserRentals = this.getUserRentals.bind(this);
        this.getProductsByRentals = this.getProductsByRentals.bind(this);
        this.generateInvoice = this.generateInvoice.bind(this);
        this.fetchUserData = this.fetchUserData.bind(this);
    }

    /* Method that returns all current and past rentals for a specific User_Id */
    public async getUserRentals(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // we have the user id from the session

        try {
            const rentals = await RentalManager.getRentalsFromUser(userId); // rentals[0] is active rentals, rentals[1] is past rentals

            if (rentals[0].length === 0 && rentals[1].length === 0) {
                response.status(404).json({ code: 404, message: 'Keine Buchungen gefunden.' });
                return;
            }

            response.status(200).json({ code: 200, activeRentals: rentals[0], pastRentals: rentals[1] });
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Buchungen.' });
        }
    }

    // get the reservation for a user, if it exists
    public async getUserReservation(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // we have the user id from the session

        try {
            /* Get the reservation for the user including name and image from the product table */
            const reservation = await ReservationManager.getReservationFromUser(userId, null, true);
            if(!reservation) {
              response.status(200).json({ code: 200, message: 'Keine Reservierung gefunden.' });
              return;
            }

            response.status(200).json({ code: 200, reservation: reservation });
            return;
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Reservierung.' });
        }
    }

    // end the reservation for a user, if it exists
    public async endUserReservation(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // we have the user id from the session

        try {
            const reservation = await ReservationManager.getReservationFromUser(userId);
            if(!reservation) {
                response.status(404).json({ code: 404, message: 'Keine Reservierung gefunden.', hasReservation: false });
                return;
            }
            await ReservationManager.endReservation(reservation);

            response.status(200).json({ code: 200, message: 'Reservierung erfolgreich beendet.' });
            return;
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Aufheben der Reservierung.' });
        }
    }

    // reserve a scooter for a given user
    public async reserveScooter(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // we have the user id from the session

        const scooterId = request.body.scooterId;
        try {
            const reservation = await ReservationManager.startReservation(userId, scooterId);
            
            response.status(200).json({ code: 200, reservation: reservation });
            return;
        } catch (error) {
            if(error.message === 'SCOOTER_DOES_NOT_EXIST') {
                response.status(404).json({ code: 404, message: 'Angegebener Scooter existiert nicht.' });
                return;
            }
            if(error.message === 'SCOOTER_UNAVAILABLE'){
                response.status(401).json({ code: 401, message: 'Scooter ist nicht mehr verfügbar.', scooterAvailable: false });
                return;
            }
            if(error.message === 'USER_HAS_RESERVATION') {
                response.status(401).json({ code: 401, message: 'Es kann nur ein Scooter gleichzeitig reserviert werden.' });
                return;
            }
            if(error.message === 'RESERVATION_FAILED') {
                response.status(500).json({ code: 500, message: 'Reservierung konnte nicht angelegt werden.' });
                return;
            }
            response.status(500).json({ code: 500, message: 'Fehler beim Reservieren. Bitte versuche es später noch einmal.' });
            return;
        }
    }

    /* Method that return for all bookings the product + the scooterId from the scooter table */
    public async getProductsByRentals(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie

        try {
            // Get all rental contracts of the user
            const allRentals = await RentalManager.getAllRentalsByUserId(userId);

            // / Extract the scooter IDs from the rental agreements
            const scooterIds = [...new Set(allRentals.map(rental => rental.scooterId))];  // Use a Set to remove duplicates
            
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
        const { rentalId } = request.body;
        let selectedCurrency = request.body.selectedCurrency;

        if (!selectedCurrency) {
            selectedCurrency = '€'; // Default currency
        }

        if (!rentalId) {
            response.status(400).json({ code: 400, message: 'Keine Buchungs-ID angegeben.' });
            return;
        }

        try {

            // Search for a rental agreement using the rentalId
            const rental = await RentalManager.getFullyPaidRentalByRentalId(rentalId);

            if (!rental) {
                response.status(404).json({ code: 404, message: 'Buchung nicht gefunden.' });
                return;
            }

            if (rental.userId !== response.locals.userId) {
              /* Not athorized, user is not the owner of the rental */
              response.status(404).json({ code: 404, message: 'Buchung nicht gefunden.' });
              return;
            }

            /* Get the name for a scooterID*/
            const scooterName = await this.getProductIdForScooter(rental.scooterId);
            if (!scooterName) {
                response.status(404).json({ code: 404, message: 'Produkt nicht gefunden.' });
                return;
            }

            /* Get the price for a specific scooter */
            const pricePerHour = await this.getPricePerHourByScooterName(scooterName);
            if (!pricePerHour) {
                response.status(404).json({ code: 404, message: 'Keinen Preis für den Scooter gefunden.' });
                return;
            }

             // Fetch user data
             const userId = response.locals.userId;
             const userData = await this.fetchUserData(userId);
             if (!userData) {
                 response.status(404).json({ code: 404, message: 'Benutzerdaten nicht gefunden.' });
                 return;
             }

            // Create PDF
            const pdfBytes = await CreateInvoice.editPdf(rental.id, userData.email, userData.name, userData.street, scooterName.toString(), rental.total_price, pricePerHour, rental.createdAt.toString(), rental.endedAt.toString(), selectedCurrency);

            // Send PDF binary as an answer
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', 'inline; filename="InvoiceScooter.pdf"');
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

    /* Returns the scooter name for a specific scooterId*/
    private async getProductIdForScooter(scooterId: number): Promise<unknown> {
        try {
            const scooter = await Scooter.findOne({
                where: {
                    id: scooterId
                },
                attributes: ['product_id']
            });

            if (!scooter) {
                throw new Error(`Scooter with ID ${scooterId} not found`);
            }

            return scooter.get('product_id');
        } catch (error) {
            console.error(`Error fetching product ID for scooter ID ${scooterId}:`, error);
            throw error;
        }
    }


    /* Get for a scooter name the price_per_hour  */
    public async getPricePerHourByScooterName(scooterName: unknown): Promise<number> {
        if (!scooterName) {
            throw new Error('Kein Scooter-Name angegeben.');
        }
    
        try {
            // Fetch product data based on the scooter name
            const product = await Product.findOne({
                where: {
                    name: scooterName
                },
                attributes: ['price_per_hour']
            });
    
            if (!product) {
                throw new Error('Product not found.');
            }
    
            // Extract the price per hour
            const pricePerHour = product.get('price_per_hour') as number;
            return pricePerHour;
        } catch (error) {
            console.error('Error when retrieving the hourly rate:', error);
            throw new Error('Error when retrieving the hourly rate.');
        }
    }
}

export default new BookingsController();