import { PaymentOptions } from './payment';

export type ResponseMessage = {
    code: number,
    message: string
}

export interface ResObjAllPaymentOptions {
  code: number,
  body: PaymentOptions[]
}

export interface ResponseMessageCheckout {
  code: number;
  message: string;
  booking?: {
    endedAt?: string;
  }
}

export interface ResponseMessageReservation {
  code: number;
  message: string;
  reservation?: {
    id: number;
    user_id: number;
    scooter_id: number;
    endsAt: string;
  }
}