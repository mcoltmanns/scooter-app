import { Request, Response } from 'express';
import BachelorCard from '../services/payment/bachelorcard';
import SwpSafe from '../services/payment/swpsafe';
import HciPal from '../services/payment/hcipal';
import { PaymentMethod } from '../models/payment';

const bachelorcardMerchant = 'ScooterApp';

export class PaymentController {
  public async getAllPaymentMethods(
    request: Request,
    response: Response
  ): Promise<void> {
    /*
        const codeInfo = await SwpSafe.getCountryCode('y^t@y7#uMYu@');
        console.log(codeInfo);
        const userId = response.locals.userId;
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
            return;
        }
        try {
            const paymentMethods = await PaymentMethod.findAll({ where: {usersDataId: userId } });
            response.status(200).json({ paymentMethods });
            return;
        } catch (error) {
            response.status(500).send();
        }
        */
    // Testing methods
    /*console.log('country');
        console.log(await SwpSafe.getCountryCode(request.body.swpsafe));
        console.log(await BachelorCard.getCountryCode(request.body.merchant, request.body.cardNumber));
        console.log(await HciPal.getCountryCode(request.body.accountName));
        console.log('transaction');
        const ss = await SwpSafe.initTransaction(request.body.swpsafe, request.body.amount);
        const bc = await BachelorCard.initTransaction(request.body.merchant, request.body.cardNumber, request.body.cardName, request.body.securityCode, request.body.expirationDate, request.body.amount);
        const hp = await HciPal.initTransaction(request.body.accountName, request.body.accountPassword, request.body.amount);
        console.log(ss);
        console.log(bc);
        console.log(hp);
        console.log('commit');
        console.log(await SwpSafe.commitTransaction(ss.message));
        console.log(await BachelorCard.rollbackTransaction(request.body.merchant, bc.message));
        console.log(await HciPal.commitTransaction(hp.message));*/
    response.status(200).json([
      {
        type: 'swpsafe',
        info: {
          name: 'Paul Milgram',
          swpCode: 'y^t@y7#uMYu@',
        },
      },
      {
        type: 'hcipal',
        info: {
          name: 'Paul Milgram',
          accountName: 'paul@milgram.de',
          accountPassword: 'zJac6Em^q7JrG@w!FMf4@',
        },
      },
      {
        type: 'bachelorcard',
        info: {
          name: 'Paul Milgram',
          cardNumber: '4485-5420-1334-7098',
          securityCode: '000',
          expirationDate: '4/44',
        },
      },
    ]);
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
}
