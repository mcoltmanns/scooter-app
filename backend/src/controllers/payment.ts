import { Request, Response } from 'express';
import BachelorCard from '../services/payment/bachelorcard';
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
       // Testing methods
       /*console.log(await BachelorCard.getCountryCode('test-merchant', '4485-5420-1334-7098'));
       console.log(await SwpSafe.getCountryCode('y^t@y7#uMYu@'));
       const transaction = await SwpSafe.getTransaction('y^t@y7#uMYu@', 10);
       console.log(transaction);
       SwpSafe.commitTransaction(transaction.message);*/
       response.status(200).json([
        {
            type: 'swpsafe',
            info: {
                name: 'Paul Milgram',
                swpCode: 'y^t@y7#uMYu@'
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
