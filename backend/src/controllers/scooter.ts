import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { Op } from 'sequelize';
import { ActiveRental, Reservation } from '..//models/rental';

export class ScooterController {
    // get scooters that aren't rented
    public async getAvailableScooters(request: Request, response: Response): Promise<void> {
        /* Make sure we actually have a user */
        const userId = Number(response.locals.userId);
        if (!userId) {
          response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
          return;
        }

        let scooters = [];
        try {
            /* Find all scooters that are not rented and not reserved by someone else (reservation by the user himself is fine) */
            // scooters = (await Scooter.findAll({
            //   where: { 
            //     active_rental_id: null,
            //     [Op.or]: [
            //       { reservation_id: null },
            //       { '$reservation.user_id$': userId }
            //     ]
            //   },
            //   include: [{
            //     model: Reservation,
            //     as: 'reservation',
            //     attributes: ['id', 'user_id']
            //   }]
            // })).map((scooterModel) => {
            //   const scooter = scooterModel.get();
            //   delete scooter.reservation;
            //   return scooter;
            // });
            scooters = (await Scooter.findAll({
              where: { 
                active_rental_id: null,
                [Op.or]: [
                  { reservation_id: null },
                  { '$reservation.user_id$': userId }
                ]
              },
              include: [{
                model: Reservation,
                as: 'reservation',
                attributes: ['id', 'user_id'],
                required: false // Perform a left outer join
              }, {
                model: ActiveRental,
                as: 'activeRental',
                attributes: ['id'],
                required: false, // Perform a left outer join
              }],
            })).reduce((filteredScooters, scooterModel) => {
              const scooter = scooterModel.get();
              if (scooter.activeRental === null) {
                delete scooter.reservation; // Delete the reservation object (was only needed for the query)
                delete scooter.activeRental; // Delete the activeRental object (was only needed for the query)
                filteredScooters.push(scooter); // Add the modified scooter to the result array
              }
              return filteredScooters;
            }, []);
        } catch (error) {
            console.log(error);
            response.status(500).json('Datenbank Fehler');
            return;
        }
        response.status(200).json(scooters);
        return;
    }

    /* Method to get scooter information by scooter ID */
    public async getScooterById(request: Request, response: Response): Promise<void> {
        /* Make sure we actually have a user */
        const userId = Number(response.locals.userId);
        if (!userId) {
          response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
          return;
        }

        const { scooterId } = request.params;

        try {
            // find the scooter with the matching ID and check if active_rental_id is null
            // const scooter = await Scooter.findOne({ where: { id: scooterId, active_rental_id: null } });
            
            const scooter = await Scooter.findByPk(scooterId);

            if (!scooter) {
              response.status(404).json({ code: 404, message: 'Scooter nicht gefunden.' });
              return;
            }

            const activeRental = await ActiveRental.findOne({ where: { scooterId: scooterId } });

            if (scooter.getDataValue('active_rental_id') !== null || activeRental !== null) {
              response.status(400).json({ code: 400, message: 'Scooter ist derzeit vermietet.' });
              return;
            }

            if (scooter.getDataValue('reservation_id') !== null) {
              const reservation = await Reservation.findByPk(scooter.getDataValue('reservation_id'));

              if (!reservation || reservation.getDataValue('user_id') !== userId) {
                response.status(400).json({ code: 400, message: 'Scooter ist derzeit reserviert.' });
                return;
              }
            }

            response.status(200).json(scooter); // return the scooter information
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen des Scooters.' });
        }
    }

    /* Method that gets all product information from the database */
    public async getAllProducts(request: Request, response: Response): Promise<void> {
        try {
            const products = await Product.findAll();
            response.status(200).json(products);
        } catch (error) {
            console.error(error);
            response.status(500).send('Fehler in der Produkt Tabelle');
        }
    }

    /* Method to get product information for a specific scooter ID */
    public async getProductByScooterId(request: Request, response: Response): Promise<void> {
        const { scooterId } = request.params;

        try {
            // Find the scooter with the corresponding ID
            const scooter = await Scooter.findOne({ where: { id: scooterId } });

            if (!scooter) {
                response.status(404).json({ code: 404, message: 'Scooter nicht gefunden.' });
                return;
            }

            // Find the product based on the product_id of the scooter
            const product = await Product.findOne({ where: { name: scooter.get('product_id') } });

            if (!product) {
                response.status(404).json({ code: 404, message: 'Produkt nicht gefunden.' });
                return;
            }

            response.status(200).json(product); // Return of the product for the specific scooter
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen des Produkts.' });
        }
    }
}