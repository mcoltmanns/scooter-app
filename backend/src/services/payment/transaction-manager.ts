import { Transaction } from 'sequelize';
import { PaymentMethod } from '../../models/payment';
import { BachelorCardData, SwpSafeData, HciPalData, PaymentService } from '../../interfaces/payment-service.interface';
import BachelorCard from './bachelorcard';
import HciPal from './hcipal';
import SwpSafe from './swpsafe';
import { errorMessages } from '../../static-data/error-messages';

export class TransactionManager {
    public static async getPaymentService(paymentMethodId: number, userId: number, transaction?: Transaction): Promise<{ paymentService: PaymentService, paymentData: BachelorCardData | SwpSafeData | HciPalData }> {
      const paymentMethod = await PaymentMethod.findOne({ 
        where: { id: paymentMethodId, usersAuthId: userId },
        transaction: transaction || undefined
      });
      if (!paymentMethod) {
        throw new Error(errorMessages.PAYMENT_METHOD_NOT_FOUND);
      }
      
      let paymentService: PaymentService | null = null;
      let paymentData: BachelorCardData | SwpSafeData | HciPalData | null = null;
      /* Determine the correct payment service to process the payment */
      if (paymentMethod.get('type') === 'bachelorcard') {
        paymentService = BachelorCard;
        paymentData = paymentMethod.get('data') as BachelorCardData;
      }
      if (paymentMethod.get('type') === 'swpsafe') {
        paymentService = SwpSafe;
        paymentData = paymentMethod.get('data') as SwpSafeData;
      }
      if (paymentMethod.get('type') === 'hcipal') {
        paymentService = HciPal;
        paymentData = paymentMethod.get('data') as HciPalData;
      }

      if (!paymentService || !paymentData) {
        throw new Error(errorMessages.PAYMENT_SERVICE_NOT_FOUND);
      }

      return { paymentService, paymentData };
    }

    // try to perform a transaction for a certain number of euros
    // does the heavy lifting for mapping payment method ids to the right services and making the requests
    // on success returns a rollbackable payment token and the payment service used to perform the transaction
    public static async doTransaction(paymentMethodId: number, userId: number, amount: number, transaction?: Transaction, paymentService?: PaymentService, paymentData?: BachelorCardData | SwpSafeData | HciPalData): Promise<{ token: string, serviceUsed: PaymentService }> {
        /* Fetch paymentService and the payment data/credentials in case they are not provided */
        if (!paymentService || !paymentData) {
          const { paymentService:paymentServiceRes, paymentData:paymentDataRes } = await this.getPaymentService(paymentMethodId, userId, transaction || undefined);
          paymentService = paymentServiceRes;
          paymentData = paymentDataRes;
        }

        /* Validate the payment */
        const { status:validateStatus, message:token } = await paymentService.initTransaction(paymentData, amount);

        if (validateStatus !== 200 || !token || token === '') {
            throw new Error(errorMessages.PAYMENT_FAILED);
        }

        /* Commit the payment */
        const commitPaymentResponse = await paymentService.commitTransaction(token);

        if (commitPaymentResponse.status !== 200) {
            throw new Error(errorMessages.PAYMENT_FAILED);
        }

        return { token: token, serviceUsed: paymentService };
    }

    public static async rollbackTransaction(paymentService: PaymentService, token: string): Promise<{ status: number, message: string }> {
      const rollbackPaymentResponse = await paymentService.rollbackTransaction(token);
      if (rollbackPaymentResponse.status !== 200) {
        throw new Error(errorMessages.PAYMENT_ROLLBACK_FAILED);
      }
      return rollbackPaymentResponse;
    }
}