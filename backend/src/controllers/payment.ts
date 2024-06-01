import { Request, Response } from 'express';
import BachelorCard from '../services/payment/bachelorcard';
import SwpSafe from '../services/payment/swpsafe';
import HciPal from '../services/payment/hcipal';
import { PaymentMethod } from '../models/payment';

const bachelorcardMerchant = 'ScooterApp';

export class PaymentController {
  public async getAllPaymentMethods(request: Request, response: Response): Promise<void> {
    const userId = response.locals.userId;
    if (!userId) {
        response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
        return;
    }
    try {
        const paymentMethods = await PaymentMethod.findAll({ where: {usersAuthId: userId} });
        response.status(200).json(paymentMethods);
        return;
    } catch (error) {
        console.log(error);
        response.status(500).send();
    }
  }

  /**
   * add a payment method, and associate it with the current user's login information in the database
   * expects: { type: 'swpsafe|hcipal|bachelorcard', credentials: {name, swpCode | (accountName, accountPassword) | (cardNumber, securityCode, expirationDate) } }
   */
  public async addPaymentMethod(
    request: Request,
    response: Response
  ): Promise<void> {
    switch (request.body.type) {
      case 'swpsafe':
        response.status(200).json('swpsafe');
        break;

      case 'hcipal':
        response.status(200).json('hcipal');
        break;

      case 'bachelorcard':
        response.status(200).json('bachelorcard');
        break;

      default:
        response
          .status(400)
          .json({ status: 400, message: 'Unknown payment type' });
        return;
    }
  }

  public async addBachelorcard(request: Request, response: Response): Promise<void> {
    /* Make sure we actually have a user */
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
      return;
    }

    /* Extract the relevant data from the request body */
    const { name, cardNumber, securityCode, expirationDate } = request.body;

    /* Check if this exact bachelorcard is already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'bachelorcard', data: { name, cardNumber, securityCode, expirationDate }, usersAuthId: userId } });
    if (existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Diese Bachelorcard ist bereits in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Check if the bachelorcard account is from germany */
    const { status:statusCode, message:countryCode } = await BachelorCard.getCountryCode(bachelorcardMerchant, cardNumber);

    /* Check if we got a 'Bad Request' when checking the country code */
    if (statusCode === 400) {
      response.status(400).json({
        status: 400,
        validationErrors: {
          cardNumber: 'Ungültige Kartennummer.',
        },
      });
      return;
    }

    /* Handle all other errors from checking the country code as 'Bad Gateway' */
    if (statusCode !== 200) {
      response.status(502).json({ status: 502, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.' });
      return;
    }

    /* Check if the bachelorcard is from germany */
    if (countryCode !== 'de') {
      response.status(400).json({
        status: 400,
        validationErrors: {
          cardNumber: 'Bitte verwenden Sie eine deutsche Bachelorcard.',
        },
      });
      return;
    }

    try {
      await PaymentMethod.create({ type: 'bachelorcard', data: { name, cardNumber, securityCode, expirationDate }, usersAuthId: userId });
    } catch (error) {
      response.status(500).json({ status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.' });
      return;
    }

    response.status(201).json({ code: 201, message: 'Bachelorcard hinzugefügt.' });
    return;
  }

  public async addHcipal(request: Request, response: Response): Promise<void> {
    /* Make sure we actually have a user */
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
      return;
    }

    /* Extract the relevant data from the request body */
    const { accountName, accountPassword } = request.body;

    /* Check if this exact HCIPal account is already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'hcipal', data: { accountName, accountPassword }, usersAuthId: userId } });
    if (existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Dieser HCIPal-Account ist bereits in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Check if the HCIPal account is from germany */
    const { status:statusCode, message:countryCode } = await HciPal.getCountryCode(accountName);

    /* Check if we got a 'Bad Request' when checking the country code */
    if (statusCode === 400) {
      response.status(400).json({
        status: 400,
        validationErrors: {
          accountName: 'Ungültiger HCIPal-Account.',
        },
      });
      return;
    }

    /* Handle all other errors from checking the country code as 'Bad Gateway' */
    if (statusCode !== 200) {
      response.status(502).json({ status: 502, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.' });
      return;
    }

    /* Check if the HCIPal account is from germany */
    if (countryCode !== 'germany') {
      response.status(400).json({
        status: 400,
        validationErrors: {
          accountName: 'Kein deutscher HCIPal-Account.',
        }
      });
      return;
    }

    try {
      await PaymentMethod.create({ type: 'hcipal', data: { accountName, accountPassword }, usersAuthId: userId });
    } catch (error) {
      response.status(500).json({ status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.' });
      return;
    }

    response.status(201).json({ code: 201, message: 'HCIPal-Account hinzugefügt.' });
    return;
  }

  public async addSwpsafe(request: Request, response: Response): Promise<void> {
    /* Make sure we actually have a user */
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
      return;
    }

    /* Extract the relevant data from the request body */
    const { swpCode } = request.body;

    /* Check if this exact SWPSafe account is already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'swpsafe', data: { swpCode }, usersAuthId: userId } });
    if (existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Dieser SWPSafe-Account ist bereits in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Check if the SWPSafe account is from germany */
    const { status:statusCode, message:countryCode } = await SwpSafe.getCountryCode(swpCode);

    /* Check if we got a 'Bad Request' when checking the country code */
    if (statusCode === 400) {
      response.status(400).json({
        status: 400,
        validationErrors: {
          swpCode: 'Ungültiger SWPSafe-Account.',
        },
      });
      return;
    }

    /* Handle all other errors from checking the country code as 'Bad Gateway' */
    if (statusCode !== 200) {
      response.status(502).json({ status: 502, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.' });
      return;
    }

    /* Check if the SWPSafe account is from germany */
    if (countryCode !== 'Deutschland') {
      response.status(400).json({
        status: 400,
        validationErrors: {
          swpCode: 'Kein deutscher SWPSafe-Account.'
        }
      });
      return;
    }

    try {
      await PaymentMethod.create({ type: 'swpsafe', data: { swpCode }, usersAuthId: userId });
    } catch (error) {
      response.status(500).json({ status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.' });
      return;
    }

    response.status(201).json({ code: 201, message: 'SWPSafe-Account hinzugefügt.' });
    return;
  }

  public async deleteBachelorCard(request: Request, response: Response): Promise<void> {
    /* Make sure we actually have a user */
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
      return;
    }

    /* Extract the relevant data from the request body */
    const { name, cardNumber, securityCode, expirationDate } = request.body;

    /* Check if this exact bachelorcard isn't already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'bachelorcard', data: { name, cardNumber, securityCode, expirationDate }, usersAuthId: userId } });
    if (!existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Diese Bachelorcard ist nicht in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Delete the existing payment method */
    try {
        await existingPaymentMethod.destroy();
    } catch (error) {
        response.status(500).json({status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'});
    }

    response.status(200).json({ code: 200, message: 'BachelorCard geloescht.'});
  }

  public async deleteHciPal(request: Request, response: Response): Promise<void> {
    /* Make sure we actually have a user */
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
      return;
    }

    /* Extract the relevant data from the request body */
    const { accountName, accountPassword } = request.body;

    /* Check if this exact HCIPal account is already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'hcipal', data: { accountName, accountPassword }, usersAuthId: userId } });
    if (existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Dieser HCIPal-Account ist bereits in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Delete the existing payment method */
    try {
        await existingPaymentMethod.destroy();
    } catch (error) {
        response.status(500).json({status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'});
    }

    response.status(200).json({ code: 200, message: 'HCIPal-Konto geloescht.'});
  }

  public async deleteSwpSafe(request: Request, response: Response): Promise<void> {
    /* Make sure we actually have a user */
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
      return;
    }

    /* Extract the relevant data from the request body */
    const { swpCode } = request.body;

    /* Check if this exact SWPSafe account is already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'swpsafe', data: { swpCode }, usersAuthId: userId } });
    if (existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Dieser SWPSafe-Account ist bereits in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Delete the existing payment method */
    try {
        await existingPaymentMethod.destroy();
    } catch (error) {
        response.status(500).json({status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'});
    }

    response.status(200).json({ code: 200, message: 'SWPSafe-Konto geloescht.'});
  }
}
