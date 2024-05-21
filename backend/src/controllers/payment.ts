import { Request, Response } from 'express';
import { PaymentMethod } from '../models/payment';
import SwpSafe from '../services/payment/swpsafe';

export class PaymentController {
    public async getAllPaymentMethods(request: Request, response: Response): Promise<void> {
        const codeInfo = await SwpSafe.getCountryCode('y^t@y7#uMYu@');
        console.log(codeInfo);
        const userId = response.locals.userId;
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' }); // 401: Unauthorized
            return;
        }
        try {
            const paymentMethods = await PaymentMethod.findAll({ where: {usersDataId: userId } });
            response.json({ paymentMethods }).status(200).send();
            return;
        } catch (error) {
            response.status(500).send();
        }
    }
}
