import { Request, Response } from 'express';
import BachelorCard from '../services/payment/bachelorcard';
import SwpSafe from '../services/payment/swpsafe';
import HciPal from '../services/payment/hcipal';
import { PaymentMethod } from '../models/payment';

interface PaymentMethod {
  id: number;
  type: string;
  data: {
    [key: string]: string;
  };
}

export class PaymentController {
  public async getAllPaymentMethods(request: Request, response: Response): Promise<void> {
    const userId = response.locals.userId;

    try {
        // const paymentMethods = await PaymentMethod.findAll({ where: { usersAuthId: userId } });
        const paymentMethods = await PaymentMethod.findAll({
          where: { usersAuthId: userId },
          attributes: ['id', 'type', 'data'],
        });
        
        /* Filter the payment methods to only include the allowed fields and anonymize data */
        const allowed = ['name', 'cardNumber', 'swpCode', 'accountName'];

        const filteredPaymentMethods: PaymentMethod[] = paymentMethods.map(method => {
          /* Convert the Sequelize object to a plain object */
          const plainMethod = method.get({ plain: true });
          /* Filter the data object to only include the allowed fields */
          plainMethod.data = Object.keys(plainMethod.data)
            .filter(key => allowed.includes(key))
            .reduce((obj: { [key: string]: string }, key: string) => {
              /* Anonymize the cardNumber and swpCode */
              if (key === 'cardNumber') {
                obj[key] = '**** ' + plainMethod.data[key].slice(-4);
              } else if (key === 'swpCode') {
                obj[key] = '**** ' + plainMethod.data[key].slice(-2);
              } else {
                obj[key] = plainMethod.data[key];
              }
              return obj;
            }, {});
          return plainMethod;
        });

        response.status(200).json({ status: 200, body: filteredPaymentMethods });
        return;
    } catch (error) {
        console.log(error);
        response.status(400).json({ status: 400, message: 'Keine Zahlungsmethoden hinterlegt.' });
        return;
    }
  }

  public async addBachelorcard(request: Request, response: Response): Promise<void> {
    const userId = response.locals.userId;

    /* Extract the relevant data from the request body */
    const { name, cardNumber, securityCode, expirationDate } = request.body;

    /* Check if this exact bachelorcard is already in the database for that user */
    const existingPaymentMethod = await PaymentMethod.findOne({ where: { type: 'bachelorcard', data: { name, cardNumber, securityCode, expirationDate }, usersAuthId: userId } });
    if (existingPaymentMethod) {
      response.status(400).json({ status: 400, message: 'Diese Bachelorcard ist bereits in Ihrem Konto hinterlegt.' });
      return;
    }

    /* Check if the bachelorcard account is from germany */
    const { status:statusCode, message:countryCode } = await BachelorCard.getCountryCode(cardNumber);

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
    const userId = response.locals.userId;

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
    const userId = response.locals.userId;

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

  public async deletePayment(request: Request, response: Response): Promise<void> {
    const userId = response.locals.userId;

    /* Extract the relevant data from the request parameters */
    const paymentId = request.params.paymentId;

    /* Check if this exact payment method exists in the database for that user */
    let paymentMethod;
    try {
      paymentMethod = await PaymentMethod.findOne({ where: { id: paymentId, usersAuthId: userId } });
    } catch (error) {
      response.status(500).json({status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'});
    }

    if (!paymentMethod) {
      response.status(400).json({ status: 400, message: 'Diese Zahlungsmethode existiert in Ihrem Konto nicht.' });
      return;
    }

    /* Delete the respective payment method */
    try {
      await paymentMethod.destroy();
    } catch (error) {
        response.status(500).json({status: 500, message: 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'});
    }

    response.status(200).json({ code: 200, message: 'Zahlungsmethode gelöscht.' });
    return;
  }
}
