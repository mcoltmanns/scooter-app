import { Request, Response } from 'express';
import { UserPreferences} from '../models/user';
import Database from '../database';

export class OptionController{
    /* Method that returns all entries from the UserPreferences table */
    public async getAllUserPreferences(request: Request, response: Response): Promise<void> {
        try {
            const userPreferences = await UserPreferences.findAll();
            response.status(200).json(userPreferences);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Benutzereinstellungen' });
        }
    }

    /* Method to find an entry for a user based on their userId */
    public async getUserPreferenceByUserId(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId;
        // console.log(userId);

        try {
            const userPreference = await UserPreferences.findOne({ where: { id: userId } });
            if (!userPreference) {
                response.status(404).json({  code: 404, message: 'Benutzereinstellungen nicht gefunden.' });
                return;
            }

            response.status(200).json(userPreference);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Benutzereinstellungen' });
        }
    }

    /* change user preferences */
    public async updateUserPreferences(request: Request, response: Response): Promise<void> {
        const {speed, distance, currency } = request.body;

        // Check whether all required fields are present in the request body
        if (!speed || !distance || !currency) {
            response.status(400).json({ code: 400, message: 'Geschwindigkeit, Distanz, und Währung sind Pflichtfelder.' });
            return;
        }

        const transaction = await Database.getSequelize().transaction();

        try {
            const userId = response.locals.userId;

            const existingPreferences = await UserPreferences.findOne({ where: { id: userId } });
            if (!existingPreferences) {
                response.status(404).json({ code: 404, message: 'Benutzer-Präferenzen nicht gefunden.' });
                await transaction.rollback();
                return;
            }

            // Updating the user settings
            await existingPreferences.update({ speed, distance, currency }, { transaction });
            await transaction.commit();

        } catch (error) {
            console.error(error);
            await transaction.rollback();
            response.status(500).json({  code: 500, message: 'Die Benutzereinstellungen konnten nicht aktualisiert werden.' });
        }
        response.status(200).json({ code: 200, message: 'Benutzer-Präferenzen erfolgreich aktualisiert.' });
    }
}