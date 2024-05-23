import { Request, Response } from 'express';
import { PaymentMethod } from '../models/payment';
import SwpSafe from '../services/payment/swpsafe';

export class PaymentController {
    public async getAllPaymentMethods(request: Request, response: Response): Promise<void> {
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
       response.status(200).json([
        {
            type: 'swpsafe',
            info: {
                name: 'Paul Milgram',
                swpCode: '%255R7bbmTZQ%26VAfTAunJpCDhFaQ9iFVwt%21a4%24%5EUdGf%24Xey3%5EW'
            }
        },
        {
            type: 'hcipal',
            info: {
                name: 'Paul Milgram',
                accountName: 'paul@milgram.de',
                accountPassword: 'zJac6Em^q7JrG@w!FMf4@'
            }
        },
        {
            type: 'bachelorcard',
            info: {
                name: 'Paul Milgram',
                cardNumber: '4485-5420-1334-7098',
                securityCode: '000',
                expirationDate: '4/44'
            }
        }
       ]);
    }
}
